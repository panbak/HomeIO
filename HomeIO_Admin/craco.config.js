module.exports = {
    devServer: {
        port: 5000
    },
    style: {
        postcss: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
}