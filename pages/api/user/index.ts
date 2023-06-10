import {NextApiRequest, NextApiResponse} from "next";


// Handle any requests to /api/user
export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    // post requests
    switch(req.method) {
        // post request means create new user
        case 'POST':
            const username = req.body.username;
            const email = req.body.email;
            const password = bcrypt.hash(req.body.password);

            // upload to mongodb
            try {

            } catch (error) {
                console.log("Error", error);
            }
            break;
    }
}