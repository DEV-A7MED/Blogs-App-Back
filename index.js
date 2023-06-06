import { config } from 'dotenv';
import express from 'express'
import path from 'path'
import { initApp } from './Src/Utils/initApp.js';

const app = express()
// env 
config({ path: path.resolve('config/config.env')})
// main initiate function
initApp(app,express)