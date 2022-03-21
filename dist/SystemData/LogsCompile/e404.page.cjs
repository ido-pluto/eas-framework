require('source-map-support').install();module.exports = (_require, _include, _transfer, private_var, handelConnector) => {
            return (async function (page) {
                const __filename = "/Users/idoio/Documents/beyond-easy/tests/core/Website/Logs/e404.page", __dirname = "/Users/idoio/Documents/beyond-easy/tests/core/Website/Logs";
                const require = (p) => _require(__filename, __dirname, page, p);
                const include = (p, withObject) => _include(__filename, __dirname, page, p, withObject);
        
                var module = { exports: {} },
                    exports = module.exports,
                    { sendFile, writeSafe, write, echo, setResponse, out_run_script, run_script_name, Response, Request, Post, Query, Session, Files, Cookies, PageVar, GlobalVar} = page,

                    run_script_code = run_script_name;

                    const transfer = (p, preserveForm, withObject) => (out_run_script = {text: ''}, _transfer(p, preserveForm, withObject, __filename, __dirname, page));
                {try {

run_script_code=`run_script_name=\`Logs/e404.page\`;`;
//!/Users/idoio/Documents/beyond-easy/tests/core/Website/:0:0
run_script_name=`Logs/e404.page`;
out_run_script.text+=`<!DOCTYPE html>
<html lang="en" me=more>

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>EAS Tests |
        Page Not Found
    </title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/vinorodrigues/bootstrap-dark@0.6.1/dist/bootstrap-dark.min.css" />
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    
</head>

<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <a class="navbar-brand" href="/">EAS - Tests</a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    `;
run_script_code=`run_script_name=\`Logs/e404.page\`;`;
//!/Users/idoio/Documents/beyond-easy/tests/core/Website/:0:0
run_script_name=`Logs/e404.page`;{out_run_script.text+=`

<li class="nav-item">
    <a class="nav-link" href="/">Home</a>
</li>`;}
out_run_script.text+=`
                    `;
run_script_code=`run_script_name=\`Logs/e404.page\`;`;
//!/Users/idoio/Documents/beyond-easy/tests/core/Website/:0:0
run_script_name=`Logs/e404.page`;{out_run_script.text+=`

<li class="nav-item">
    <a class="nav-link" href="/tests">Tests</a>
</li>`;}
out_run_script.text+=`
                    `;
run_script_code=`run_script_name=\`Logs/e404.page\`;`;
//!/Users/idoio/Documents/beyond-easy/tests/core/Website/:0:0
run_script_name=`Logs/e404.page`;{out_run_script.text+=`

<li class="nav-item">
    <a class="nav-link" href="/static">Generated Static</a>
</li>`;}
out_run_script.text+=`
                    `;
run_script_code=`run_script_name=\`Logs/e404.page\`;`;
//!/Users/idoio/Documents/beyond-easy/tests/core/Website/:0:0
run_script_name=`Logs/e404.page`;{out_run_script.text+=`

<li class="nav-item">
    <a class="nav-link" href="/compile">Generated Compile</a>
</li>`;}
out_run_script.text+=`
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            Dropdown
                        </a>
                        <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                            <li><a class="dropdown-item" href="#">Action</a></li>
                            <li><a class="dropdown-item" href="#">Another action</a></li>
                            <li>
                                <hr class="dropdown-divider">
                            </li>
                            <li><a class="dropdown-item" href="#">Something else here</a></li>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link disabled" href="#" tabindex="-1" aria-disabled="true">Disabled</a>
                    </li>
                </ul>
                <form class="d-flex">
                    <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
                    <button class="btn btn-outline-success" type="submit">Search</button>
                </form>
            </div>
        </div>
    </nav>
    
    <main class="flex-shrink-0 pt-5">
        <div class="container mt-5">
            
<h1>Error - 404</h1>
        </div>
    </main>
</body>

</html>`;
}
                catch(e){
                    run_script_name += ' -> <line>' + e.stack.split(/\n( )*at /)[2];
                    out_run_script.text += '<p style="color:red;text-align:left;font-size:16px;"><p>Error path: ' + run_script_name.replace(/<line>/gi, '<br/>') + '</p><p>Error message: ' + e.message + '</p></p>';
        
                    console.error("Error path: " + run_script_name.replace(/<line>/gi, '\n'));
                    console.error("Error message: " + e.message);
                    console.error("Error runing this code: '" + run_script_code + "'");
                    console.error("Error stack: " + e.stack);
                }}});}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3Rlc3RzL2NvcmUvV2Vic2l0ZS9Nb2RlbHMvV2Vic2l0ZS5tb2RlIiwiLi4vLi4vLi4vdGVzdHMvY29yZS9XZWJzaXRlL0NvbXBvbmVudHMvTmF2TGluay5pbnRlIiwiLi4vLi4vLi4vdGVzdHMvY29yZS9XZWJzaXRlL0xvZ3MvZTQwNC5wYWdlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFBQTs7QUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEJBOztBQUVBO0FBQ0E7QUFDQTs7QURpQkE7OztBQ3JCQTs7QUFFQTtBQUNBO0FBQ0E7O0FEa0JBOzs7QUN0QkE7O0FBRUE7QUFDQTtBQUNBOztBRG1CQTs7O0FDdkJBOztBQUVBO0FBQ0E7QUFDQTs7QURvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUVwREE7QUZxREE7QUFDQTtBQUNBOztBQUVBIiwiZmlsZSI6ImU0MDQucGFnZS5janMifQ==