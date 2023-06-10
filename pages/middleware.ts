import {NextResponse} from 'next/server'
import type {NextRequest} from 'next/server'

const jwt = require('jsonwebtoken')


// See "Matching Paths" below to learn more
// exclude /api/signin and /api/signup and /
export const config = {
    matcher: '/signin|/signup|/'
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // ensure user has jwt token
    const token = request.cookies.get('token');
    if (token == null) {
        return NextResponse.redirect('/signin')
    }
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            // invalid token, set status to 401
            return NextResponse.redirect('/signin')
        }
    });
    return NextResponse.next()
}