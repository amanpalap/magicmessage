import dbConnect from "@/lib/dbconnect";
import UserModel from "@/model/User.model";
import bcryptjs from 'bcryptjs'
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

