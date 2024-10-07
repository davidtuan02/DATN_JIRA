const MergeJsonWebpackPlugin = require("merge-jsons-webpack-plugin");

module.exports = {
    plugins: [
        new MergeJsonWebpackPlugin({
            output: {
                groupBy: [
                    { pattern: "./src/assets/i18n/vi/*.json", fileName: "./assets/i18n/vi.json" },
                    { pattern: "./src/assets/i18n/en/*.json", fileName: "./assets/i18n/en.json" },
                ]
            }
        }),
    ]
}
