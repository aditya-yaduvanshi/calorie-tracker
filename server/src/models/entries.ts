import {Schema, Document, model, Types, ObjectId} from 'mongoose';

export interface IEntry {
	user: ObjectId;
	name: string;
	calorie: number;
	price: number;
	date: Date;
	time: string;
}

export interface IEntrySchema extends IEntry, Document {
	creadtedAt: Date;
	updatedAt: Date;
}

export interface IEntryAnalytics {
	user: ObjectId;
	calories: {
		date: Date;
		calorie: number;
	}[];
	prices: {
		date: Date;
		price: number;
	}[];
}

export interface IEntryAnalyticsSchema extends IEntryAnalytics, Document {
	creadtedAt: Date;
	updatedAt: Date;
}

const EntrySchema = new Schema<IEntrySchema>(
	{
		user: {
			type: Types.ObjectId,
			required: true,
			ref: 'users',
		},
		name: {
			type: String,
			required: true,
			minlength: 1,
			maxlength: 62,
		},
		calorie: {
			type: Number,
			required: true,
			min: 0,
			max: 5000,
		},
		price: {
			type: Number,
			required: true,
			min: 0,
			max: 9999999999,
		},
		time: {
			type: String,
			required: true,
		},
		date: {
			type: Date,
			required: true,
		},
	},
	{timestamps: true}
);

const EntryAnalyticsSchema = new Schema(
	{
		user: {
			type: Types.ObjectId,
			required: true,
			unique: true,
			ref: 'users',
		},
		calories: {
			type: [
				{
					date: {
						type: Date,
						required: true,
					},
					totalCalorie: {
						type: Number,
						required: true,
					},
					numOfEntries: {
						type: Number,
						required: true,
					}
				},
			],
			required: true,
		},
		prices: {
			type: [
				{
					date: {
						type: Date,
						required: true,
					},
					price: {
						type: Number,
						required: true,
					},
				},
			],
			required: true,
		},
	},
	{timestamps: true}
);

const EntryAnalytics = model('entry-analytics', EntryAnalyticsSchema);
const Entries = model('entries', EntrySchema);

export {Entries, EntryAnalytics};
