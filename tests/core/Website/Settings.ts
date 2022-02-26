export default {
    development: false, // development mode, if off, then is optimize for production

    general: {
        pageInRam: true,
        importOnLoad: ["OnStart.serv.ts"]
    },

    compile: {
        compileSyntax: ["Razor", "TypeScript"],
        ignoreError: [], //"close-tag" | "querys-not-found" | "component-not-found" | "ts-warning" | "js-warning" | "page-not-found" | "sass-import-not-found" | "css-warning" | "compilation-error" | "jsx-warning" | "tsx-warning"
        plugins: [], // "MinAll" | "MinHTML" | "MinCss" | "MinSass" | "MinJS" | "MinTS" | "MinJSX" | "MinTSX"...
    },

    routing: {
        rules: {
            "/Examples/User/": (req, res, url) => '/Files/User/Examples/' + url.split('/').pop()
        },
        urlStop: [ // make sure any path after x remains same as x, for example /admin/editUsers/34234/cool => /admin/editUsers
            "/User/Files"
        ],
        errorPages: {
            notFound: {
                code: 404,
                path: "errors/e404"
            },
            serverError: {
                code: 500,
                path: "errors/e500"

            }
        },
        ignoreTypes: ["json"], // ignore file extension (auto ignore common server files)
        ignorePaths: ["/Private"],
    }, 
    serveLimits: {
        cacheDays: 3,
        fileLimitMB: 10,
        requestLimitMB: 4,
        cookiesExpiresDays: 1,
        sessionTotalRamMB: 150,
        sessionTimeMinutes: 40,
        sessionCheckPeriodMinutes: 30,
    },
    serve: {
        port: 8080,
        http2: false,
        greenLock: { // for production
            agreeToTerms: false,
            email: "example@example.com",
            sites: [{ "subject": "example.com", "altnames": ["example.com", "www.example.com"] }]
        }
    },
    //custom settings - same as above but only active if development is on/off
    implDev: {
        //custom settings for development
    }, 
    impProd: {
        //custom settings for production
    }
}