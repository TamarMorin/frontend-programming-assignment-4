const {withSuperjson} = require('next-superjson')

module.exports = withSuperjson()({
    images: {
        domains: ['res.cloudinary.com'],
    },
})