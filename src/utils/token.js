import jwt from "jsonwebtoken"

const gentoken = (userId) => {
    try {
        const token = jwt.sign(
            { id: userId},
            process.env.JWT_SECRET,
            {expiresIn: "7d"});
            return token;
    } catch (error) {
        console.error("JWT generation failed: ", error.message);
        throw error;
    }
}

export default gentoken