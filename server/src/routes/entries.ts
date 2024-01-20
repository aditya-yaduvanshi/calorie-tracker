import {Router} from 'express';
import {FilterQuery} from 'mongoose';
import {IRequest} from '../middlewares/auth';
import {Entries, EntryAnalytics, IEntry, IEntrySchema} from '../models/entries';
import Users from '../models/users';
import Validator from '../utils/validator';
import {IJwtPayload} from '../utils/verifier';

const router = Router();

export interface IEntryQuery {
	fromDate?: string;
	toDate?: string;
	onDate?: string;
}

router
	.route('/')
	.get(async (req: IRequest, res) => {
		try {
			const user = req.user as IJwtPayload;
			let {fromDate, toDate, onDate} = req.query as IEntryQuery;

			let findQuery: FilterQuery<IEntrySchema> = {};

			if (user.role !== 'admin') findQuery.user = user._id;
			if (fromDate) findQuery.date = {$gte: new Date(fromDate)};
			if (toDate) findQuery.date = {$lte: new Date(toDate)};
			if (onDate) findQuery.date = new Date(onDate);

			let [entries, analytics] = await Promise.all([
				Entries.find(findQuery)
					.populate('user', `name email _id`, 'users')
					.sort({updatedAt: -1}),
				user.role !== 'admin' ? EntryAnalytics.findOne({user: user._id}) : null,
			]);

			let calorieCountToday: number = 0,
				priceSpentToday: number = 0;
			if (analytics) {
				calorieCountToday =
					analytics?.calories.find(
						(cal) =>
							cal.date.toISOString().split('T')[0] ===
							new Date().toISOString().split('T')[0]
					)?.totalCalorie ?? calorieCountToday;

				priceSpentToday =
					analytics?.prices.find(
						(pr) =>
							pr.date.toISOString().split('T')[0] ===
							new Date().toISOString().split('T')[0]
					)?.price ?? priceSpentToday;
			}

			return res.status(200).json({
				error: 0,
				data: {
					entries,
					calorieCountToday,
					priceSpentToday,
				},
			});
		} catch (err) {
			console.log(err);
			return res.status(400).json({error: 1, msg: (err as Error).message});
		}
	})
	.post(async (req: IRequest, res) => {
		try {
			const user = req.user as IJwtPayload;
			const body = req.body as IEntry;

			if (
				!body.name ||
				!body.time ||
				!body.date ||
				(user.role === 'admin' && !body.user)
			)
				return res.status(400).json({
					error: 1,
					msg: 'All fields are required and cannot be empty!',
				});

			if (!Validator.isFoodName(body.name))
				return res
					.status(400)
					.json({error: 0, msg: 'Food name should be alpha numeric value.'});

			if (typeof body.calorie !== 'number' || body.calorie < 0)
				return res
					.status(400)
					.json({error: 0, msg: 'Calorie should a positive number or zero.'});

			if (typeof body.price !== 'number' || body.price < 0)
				return res
					.status(400)
					.json({error: 0, msg: 'Price should a positive number or zero.'});

			if (!Validator.isValidDateTime(body.date, body.time))
				return res.status(400).json({
					error: 1,
					msg: "Date and Time should be in valid format 'YYYY-MM-DD' & 'HH:MM' and should not exceeds current date and time.",
				});

			let userAnalytics = await EntryAnalytics.findOne({
				user: user.role === 'admin' ? body.user : user._id,
			});

			let entryBody = {
				user: user._id,
				name: body.name,
				calorie: body.calorie,
				price: body.price,
				time: body.time,
				date: new Date(body.date),
			};

			let entry = new Entries(entryBody);

			if (userAnalytics) {
				let entryDateCaloriesIndex = userAnalytics.calories.findIndex(
					(cal) => cal.date.toISOString().split('T')[0] === entry.date.toISOString().split('T')[0]
				);

				if (entryDateCaloriesIndex < 0) {
					entryDateCaloriesIndex =
						userAnalytics.calories.push({
							date: entry.date,
							totalCalorie: entry.calorie,
							numOfEntries: entryDateCaloriesIndex + 1,
						}) - 1;
				} else {
					userAnalytics.calories[entryDateCaloriesIndex].totalCalorie +=
						entry.calorie;
					userAnalytics.calories[entryDateCaloriesIndex].numOfEntries++;
				}

				let todayPricesIndex = userAnalytics.prices.findIndex(
					(pr) => pr.date.toISOString().split('T')[0] === entry.date.toISOString().split('T')[0]
				);
				if (todayPricesIndex < 0) {
					todayPricesIndex =
						userAnalytics.prices.push({date: entry.date, price: entry.price}) -
						1;
				} else {
					userAnalytics.prices[todayPricesIndex].price += entry.price;
				}
			}

			await Promise.all([entry.save(), userAnalytics?.save()]);
			return res.status(200).json({
				error: 0,
				data: {
					entry: {
						...entryBody,
						_id: entry._id,
						createdAt: entry.creadtedAt,
						updatedAt: entry.updatedAt,
					},
					calorieCountToday:
						userAnalytics?.calories.find(
							(cal) =>
								cal.date.toISOString().split('T')[0] ===
								new Date().toISOString().split('T')[0]
						)?.totalCalorie ?? 0,
					priceSpentToday:
						userAnalytics?.prices.find(
							(pr) =>
								pr.date.toISOString().split('T')[0] ===
								new Date().toISOString().split('T')[0]
						)?.price ?? 0,
				},
			});
		} catch (err) {
			console.log(err);
			if ((err as Error).name === 'ValidationError') {
				return res.status(400).json({error: 1, msg: 'Invalid input data!'});
			}
			return res.status(400).json({error: 1, msg: (err as Error).message});
		}
	});

router
	.route('/:_id')
	.put(async (req: IRequest, res) => {
		try {
			let {
				params: {_id},
				user,
				body,
			} = req;
			user = user as IJwtPayload;
			body = body as Partial<IEntry>;

			if (
				!body.user &&
				!body.name &&
				!body.calorie &&
				!body.price &&
				!body.time &&
				!body.date
			)
				return res.status(400).json({error: 1, msg: 'Body cannot be empty!'});

			let entry: IEntrySchema | null;
			if (user.role === 'admin') entry = await Entries.findById(_id);
			else entry = await Entries.findOne({_id, user: user._id});

			if (!entry)
				return res.status(400).json({
					error: 1,
					msg: 'Either entry does not exists or user has no permission to access it!',
				});

			let inputUserAnalytics,
				entryUserAnalytics = await EntryAnalytics.findOne({user: entry.user}),
				entryDate = entry.date,
				entryPrice = entry.price,
				entryCalorie = entry.calorie;
			if (user.role === 'admin' && body.user) {
				let inputUser = await Users.exists({_id: body.user});

				if (!inputUser)
					return res.status(400).json({
						error: 1,
						msg: 'Invalid user id.',
					});

				entry.user = body.user;
				inputUserAnalytics = await EntryAnalytics.findOne({
					user: inputUser._id,
				});
			}
			if (body.name) entry.name = body.name;
			if (body.time && Validator.isValidDateTime(entry.date, body.time))
				entry.time = body.time;
			if (
				body.date &&
				Validator.isValidDateTime(body.date, body.time ?? entry.time)
			)
				entry.date = new Date(body.date);
			if (
				body.calorie &&
				typeof body.calorie === 'number' &&
				body.calorie >= 0
			) {
				entry.calorie = body.calorie;
				if (inputUserAnalytics) {
					let index = inputUserAnalytics.calories.findIndex(
						(cal) => cal.date.toISOString().split('T')[0] === entry?.date.toISOString().split('T')[0]
					);
					if (index > -1) {
						inputUserAnalytics.calories[index].totalCalorie += entry.calorie;
						inputUserAnalytics.calories[index].numOfEntries++;
					}
				}

				if (entryUserAnalytics) {
					let index = entryUserAnalytics.calories.findIndex(
						(cal) => cal.date.toISOString().split('T')[0] === entryDate.toISOString().split('T')[0]
					);
					if (index > -1) {
						entryUserAnalytics.calories[index].totalCalorie -= entryCalorie;
					}
				}
			}
			if (body.price && typeof body.price === 'number' && body.price >= 0) {
				entry.price = body.price;
				if (inputUserAnalytics) {
					let index = inputUserAnalytics.prices.findIndex(
						(pr) => pr.date.toISOString().split('T')[0] === entry?.date.toISOString().split('T')[0]
					);
					if (index > -1) {
						inputUserAnalytics.prices[index].price += entry.price;
					}
				}

				if (entryUserAnalytics) {
					let index = entryUserAnalytics.prices.findIndex(
						(pr) => pr.date.toISOString().split('T')[0] === entryDate.toISOString().split('T')[0]
					);
					if (index > -1) {
						entryUserAnalytics.prices[index].price -= entryPrice;
					}
				}
			}

			if (inputUserAnalytics && entryUserAnalytics) {
				await Promise.all([
					inputUserAnalytics.save(),
					entryUserAnalytics.save(),
					entry.save(),
				]);
			} else {
				await Promise.all([entryUserAnalytics?.save(), entry.save()]);
			}

			let data: any = {
				entry,
			};
			if (user.role !== 'admin') {
				data = {
					...data,
					calorieCountToday:
						entryUserAnalytics?.calories.find(
							(cal) =>
								cal.date.toISOString().split('T')[0] ===
								new Date().toISOString().split('T')[0]
						)?.totalCalorie ?? 0,
					priceSpentToday:
						entryUserAnalytics?.prices.find(
							(pr) =>
								pr.date.toISOString().split('T')[0] ===
								new Date().toISOString().split('T')[0]
						)?.price ?? 0,
				};
			}

			return res.status(200).json({error: 0, data});
		} catch (err) {
			console.log(err);
			if ((err as Error).name === 'ValidationError') {
				return res.status(400).json({error: 1, msg: 'Invalid input data!'});
			}
			return res.status(400).json({error: 1, msg: (err as Error).message});
		}
	})
	.delete(async (req: IRequest, res) => {
		try {
			let {
				params: {_id},
				user,
			} = req;

			user = user as IJwtPayload;

			let entry: IEntrySchema | null;
			if (user.role === 'admin') entry = await Entries.findByIdAndRemove(_id);
			else entry = await Entries.findOneAndDelete({_id, user: user._id});

			if (!entry)
				return res.status(400).json({
					error: 1,
					msg: 'Either entry does not exists or user has no permission to access it!',
				});

			let entryUserAnalytics = await EntryAnalytics.findOne({user: entry.user});
			if (entryUserAnalytics) {
				let calorieIndex = entryUserAnalytics.calories.findIndex(
					(cal) => cal.date.toISOString().split('T')[0] === entry?.date.toISOString().split('T')[0]
				);
				if (calorieIndex > -1) {
					entryUserAnalytics.calories[calorieIndex].totalCalorie -=
						entry.calorie;
					entryUserAnalytics.calories[calorieIndex].numOfEntries--;
				}

				let priceIndex = entryUserAnalytics.prices.findIndex(
					(pr) => pr.date.toISOString().split('T')[0] === entry?.date.toISOString().split('T')[0]
				);
				if (priceIndex > -1)
					entryUserAnalytics.prices[priceIndex].price -= entry.price;

				await entryUserAnalytics.save();
			}

			return res.sendStatus(204);
		} catch (err) {
			console.log(err);
			if ((err as Error).name === 'ValidationError') {
				return res.status(400).json({error: 1, msg: 'Invalid input data!'});
			}
			return res.status(400).json({error: 1, msg: (err as Error).message});
		}
	});

export default router;
