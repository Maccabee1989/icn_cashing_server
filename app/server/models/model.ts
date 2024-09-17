import { Model, Schema, model } from 'mongoose';
import bcrypt from "bcryptjs";
import { isValidEmail, isValidPassword, passwordPolicy } from '../utils/validator';

interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    avatar: {
        public_id: string;
        url: string;
    };
    role: string;
    isVerified: boolean;
    courses: Array<{ courseId: string }>;
}

// Put all user instance methods in this interface:
interface IUserMethods {
    fullName(): string;
    comparePassword: (password: string) => Promise<boolean>;
}

// Create a new Model type that knows about IUserMethods...
type TUserModel = Model<IUser, {}, IUserMethods>;

// And a schema that knows about IUserMethods
const userSchema = new Schema<IUser, TUserModel, IUserMethods>({
    firstName: { type: String, required: [true, "Please enter your firstName"] },
    lastName: { type: String, required: [true, "Please enter your lastName"] },
    email: {
        type: String,
        required: [true, "Please enter your email"],
        validate: {
            validator: function (value: string) {
                return isValidEmail(value);
            },
            message: "Please enter a valid email",
        },
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Please enter your password"],
        minlength: [6, "Password must be at least 6 characters"],
        validate: {
            validator: function (value: string) {
                return isValidPassword(value);
            },
            message: `Password Policy : ${passwordPolicy}`,
        },
        select: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    courses: [
        {
            courseId: String,
        }
    ],
});

// Hash Password before saving
userSchema.pre('save', async function (next) {
    // do stuff
    if (!this.isModified('password')) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
// Compare password
userSchema.methods.comparePassword = async function (enteredPassword: string): Promise<boolean> {
    return await bcrypt.compare(enteredPassword, this.password);
}
userSchema.method('fullName', function fullName() {
    return this.firstName + ' ' + this.lastName;
});

const User = model<IUser, TUserModel>('User', userSchema);

export default User;