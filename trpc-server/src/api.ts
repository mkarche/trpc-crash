import { Prisma, PrismaClient } from "@prisma/client";
import express, { Router } from "express";
import * as trpc from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";

const app = express();
const router = Router();
const prisma = new PrismaClient();

export interface UserInterface {
	id?: string;
	name?: string;
	email: string;
	age?: number;
	createdDate?: Date;
	tasks?: TaskInterface[];
}

export interface TaskInterface {
	id?: string;
	taskCode: string;
	name: string;
	dueDate?: Date;
	createdDate?: Date;
	updatedDate?: Date;
	userId?: string;
	User?: UserInterface;
}

const tasksData = [
	{ name: "task1", taskCode: "t1" },
	{ name: "task2", taskCode: "t2" },
	{ name: "task3", taskCode: "t3" },
	{ name: "task4", taskCode: "t4" },
];

const getTasks = async () => {
	await prisma.$connect();

	const tasks = await prisma.task.findMany({
		select: {
			name: true,
			dueDate: true,
			User: {
				select: {
					name: true,
					email: true,
				},
			},
		},
	});

	return tasks;
};

const generateTasks = async (tasks: TaskInterface[]) => {
	await prisma.$connect();

	await prisma.task.deleteMany();

	await prisma.task.createMany({
		data: tasks,
	});

	console.log("creating tasks on Prisma");
};

const payload = { message: "Hello World" };
const payloadTRPC = { message: "Hello World from TRPC" };

/****************** TRPC API *************** */

export const trpcRouter = trpc.router().query("/hello", {
	resolve: async (req) => {
		return payloadTRPC;
	},
});

export type TrpcRouter = typeof trpcRouter;

const api = trpcExpress.createExpressMiddleware({
	router: trpcRouter,
});

app.use("/api", api);

/***********REST API EXPRESS*****************/

// router.get("/hello", (req, res) => {
// 	res.json(payload);
// });

// router.get("/tasks", (req, res) => {
// 	const tasks = getTasks()
// 		.catch((e) => {
// 			throw e;
// 		})
// 		.finally(() => {
// 			prisma.$disconnect();
// 		});

// 	res.json(tasks);
// });

// router.post("/generateTasks", (req, res) => {
// 	console.log("entering router to generate tasks");

// 	generateTasks(tasksData)
// 		.catch((e) => {
// 			throw e;
// 		})
// 		.finally(async () => {
// 			prisma.$disconnect();
// 		});

// 	res.json(tasksData);
// });

// app.use("/api", router);

/**************** Express Server Startup ************** */

const port = process.env.PORT || 8000;

app.listen(port, () => {
	console.log(`API Server Running on port ${port}`);
});
