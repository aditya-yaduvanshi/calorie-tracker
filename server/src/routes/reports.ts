import {Router, Response} from 'express';
import {IRequest} from '../middlewares/auth';
import {Entries, EntryAnalytics} from '../models/entries';
import {IJwtPayload} from '../utils/verifier';

const router = Router();

router.get('/', async (req: IRequest, res: Response) => {
	try {
		const user = req.user as IJwtPayload;
		let thisWeekFirstDate = new Date(),
			lastWeekFirstDate = new Date();

		thisWeekFirstDate.setDate(-7);
		lastWeekFirstDate.setDate(-14);

		let [analytics, entries] = await Promise.all([
			EntryAnalytics.find({
				'calories.date': {$gte: thisWeekFirstDate},
			})
				.where('user')
				.ne(user._id)
				.populate('user', '_id name email', 'users'),
			Entries.find({date: {$gte: lastWeekFirstDate}})
				.where('user')
				.ne(user._id),
		]);

		let averageCaloriesPerDayPerUser = analytics.map((analytic) => {
			let weekPerUser = {
				user: analytic.user,
				caloriesPerDay: [{}],
			};
			for (let i = 0; i < 7; i++) {
				let date = new Date();
				date.setDate(date.getDate()-i);
				let todayCalorie = analytic.calories.find(
					(cal) =>
						cal.date.toISOString().split('T')[0] ===
						date.toISOString().split('T')[0]
				);
				weekPerUser.caloriesPerDay[i] = {
					date,
					calories: todayCalorie
						? todayCalorie.numOfEntries
							? todayCalorie.totalCalorie / todayCalorie.numOfEntries
							: 0
						: 0,
				};
			}
			return weekPerUser;
		});

		let [lastWeekEntries, thisWeekEntries] = entries.reduce(
			(count, entry) => {
				if (
					entry.date.getTime() >= lastWeekFirstDate.getTime() &&
					entry.date.getTime() < thisWeekFirstDate.getTime()
				)
					count[0]++;
				else count[1]++;
				return count;
			},
			[0, 0]
		);

		return res
			.status(200)
			.json({lastWeekEntries, thisWeekEntries, averageCaloriesPerDayPerUser});
	} catch (err) {
		return res.status(400).json({msg: (err as Error).message});
	}
});

export default router;
