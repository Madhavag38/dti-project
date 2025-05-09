import { Router } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
import { z } from "zod";
import { employeeModel, employerDashboardModel, jobsModel } from "../db.js";
const applyJobsRouter = Router()

applyJobsRouter.post("/", async function (req, res) {
    const jobId = req.body.jobId
    const username = jwt.verify(req.body.token, JWT_SECRET)
    const jobDetails = await employeeModel.findOne({
        username: username.username,
    })
    let alredyApplied = false
    if (jobDetails) {

        jobDetails.appliedId.forEach((job) => {
            if (job == jobId) {
                alredyApplied = true
            }
        })

    }

    if (alredyApplied) {
        res.json({
            message: "already applied"
        })
    } else {
        const prevapplied = jobDetails.appliedId
        prevapplied.push(jobId)
        await employeeModel.updateOne({
            username: username.username,
        }, {
            $set: {
                appliedId: prevapplied
            }
        })
        const res1 = await jobsModel.findOne({
            jobId: jobId
        })
        const employerUsername = res1.username
        const dash = await employerDashboardModel.findOne({
            username: employerUsername
        })
        const newNoApplications = dash.totalApplicationsReceived + 1
        await employerDashboardModel.updateOne({
            username: employerUsername
        }, {
            $set: {
                totalApplicationsReceived: newNoApplications
            }
        })
        res.json({
            message: "applied successfully"
        })
    }
})
applyJobsRouter.get("/", async function (req, res) {
    const username = jwt.verify(req.token, JWT_SECRET)
    const appliedJobs = await employeeModel.find({
        username: username.username,
    })
    res.json(appliedJobs)
})

export {
    applyJobsRouter
}