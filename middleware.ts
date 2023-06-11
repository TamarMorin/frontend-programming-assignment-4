import {NextResponse} from 'next/server'
import {NextRequest} from 'next/server'
import Cookies from "universal-cookie";
import {useRouter} from "next/router";
const jwt = require('jsonwebtoken')


// See "Matching Paths" below to learn more
// exclude only /api/login and /api/signup and /
// export const config = {
//     matcher: '/login|/signup'
// }

// This function can be marked `async` if using `await` inside
export function middleware(req: NextRequest) {
    console.log("inside middleware");
    console.log(`req.nextUrl.pathname is ${req.nextUrl.pathname}`);
    if (req.nextUrl.pathname === '/create') {
        // ensure user has jwt token
        console.log(`cookies is ${req.cookies}`);
        const token = req.cookies.get('token');
        if (token == null) {
            console.log(`token is null`);
            return NextResponse.redirect(new URL('/login', req.url));
        }

        console.log(`token is ${token}`);
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // invalid token, set status to 401
                console.log(`token is invalid`);
                return NextResponse.redirect(new URL('/login', req.url));

            }
        });
    }
    console.log(`passed middleware`);
    return NextResponse.next()
}