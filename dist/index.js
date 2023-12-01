"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorLabel = void 0;
var process_1 = __importDefault(require("process"));
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
exports.errorLabel = '[ERROR] express-automatic-routes:';
var validMethods = [
    'checkout',
    'copy',
    'delete',
    'get',
    'head',
    'lock',
    'merge',
    'mkactivity',
    'mkcol',
    'move',
    'm-search',
    'notify',
    'options',
    'patch',
    'post',
    'purge',
    'put',
    'report',
    'search',
    'subscribe',
    'trace',
    'unlock',
    'unsubscribe',
];
// Global config options, so we don't need to pass around these settings across recursive functions
var configOptions = {
    mount: '',
};
function scan(express, baseDir, current, log) {
    if (log === void 0) { log = false; }
    var combined = path_1.default.join(baseDir, current);
    var combinedStat = fs_1.default.statSync(combined);
    if (combinedStat.isDirectory() && isAcceptableDir(combined)) {
        for (var _i = 0, _a = fs_1.default.readdirSync(combined); _i < _a.length; _i++) {
            var entry = _a[_i];
            scan(express, baseDir, path_1.default.join(current, entry), log);
        }
    }
    else if (isAcceptableFile(combined, combinedStat)) {
        autoload(express, combined, pathToUrl(current), log);
    }
}
function isAcceptableDir(file) {
    return (!path_1.default.basename(file).startsWith('.') && !path_1.default.basename(file).startsWith('_'));
}
function isAcceptableFile(file, stat) {
    return ((file.endsWith('.js') || file.endsWith('.ts')) &&
        !path_1.default.basename(file).startsWith('.') &&
        !path_1.default.basename(file).startsWith('_') &&
        !file.endsWith('.map') &&
        !file.endsWith('.test.js') &&
        !file.endsWith('.test.ts') &&
        stat.isFile());
}
function pathToUrl(filePath) {
    var url = '/' + filePath.replace('.ts', '').replace('.js', '').replace('index', '');
    if (url.length === 1)
        return url;
    return url
        .split(path_1.default.sep)
        .map(function (part) { return replaceParamsToken(part); })
        .join('/');
}
function replaceParamsToken(token) {
    var regex = /{.+}/g;
    var result;
    while ((result = regex.exec(token)) !== null) {
        token =
            token.substring(0, result.index) +
                result[0].replace('{', ':').replace('}', '') +
                token.substr(result.index + result[0].length);
    }
    return token;
}
function autoload(express, fullPath, url, log) {
    var module = loadModule(fullPath, log);
    if (typeof module !== 'function') {
        throw new Error("".concat(exports.errorLabel, " module ").concat(fullPath, " must be valid js/ts module and should export route methods definitions"));
    }
    var routes = module(express);
    var middleware = undefined;
    if (routes.middleware) {
        middleware = routes.middleware;
    }
    for (var _i = 0, _a = Object.entries(routes); _i < _a.length; _i++) {
        var _b = _a[_i], method = _b[0], route = _b[1];
        if (validMethods.includes(method)) {
            // Prepend the mount configuration to the url
            var endpointUrl = configOptions.mount + url;
            //@ts-ignore
            express[method].apply(express, __spreadArray([endpointUrl], extract(middleware, route), false));
            if (log) {
                console.info("".concat(method.toUpperCase(), " ").concat(url, " => ").concat(fullPath));
            }
        }
    }
}
function loadModule(path, log) {
    var module = require(path);
    if (typeof module === 'function') {
        return module;
    }
    if (typeof module === 'object' && 'default' in module) {
        return module.default;
    }
    return;
}
function extract(middleware, routeOptions) {
    var routeMiddleware = middleware === undefined
        ? []
        : Array.isArray(middleware)
            ? middleware
            : [middleware];
    if (typeof routeOptions === 'function') {
        return __spreadArray(__spreadArray([], routeMiddleware, true), [withErrorHandle(routeOptions)], false);
    }
    else {
        routeOptions.middleware =
            routeOptions.middleware === undefined ? [] : routeOptions.middleware;
        if (Array.isArray(routeOptions.middleware)) {
            return __spreadArray(__spreadArray(__spreadArray([], routeMiddleware, true), routeOptions.middleware, true), [
                withErrorHandle(routeOptions.handler),
            ], false);
        }
        else {
            return __spreadArray(__spreadArray([], routeMiddleware, true), [
                routeOptions.middleware,
                withErrorHandle(routeOptions.handler),
            ], false);
        }
    }
}
function withErrorHandle(func) {
    return function errorHandle(req, res, next) {
        var rest = [];
        for (var _i = 3; _i < arguments.length; _i++) {
            rest[_i - 3] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function () {
            var e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, func.apply(void 0, __spreadArray([req, res, next], rest, false))];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        e_1 = _a.sent();
                        next(e_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
}
function default_1(express, options) {
    var _a, _b;
    var log = (_a = options.log) !== null && _a !== void 0 ? _a : true;
    if (!express) {
        var message = "".concat(exports.errorLabel, " express application must be passed");
        log && console.log(message);
        throw new Error(message);
    }
    if (!options.dir) {
        var message = "".concat(exports.errorLabel, " dir must be specified");
        log && console.error(message);
        throw new Error(message);
    }
    if (typeof options.dir !== 'string') {
        var message = "".concat(exports.errorLabel, " dir must be the path of autoroutes-directory");
        log && console.error(message);
        throw new Error(message);
    }
    var dirPath;
    if (path_1.default.isAbsolute(options.dir)) {
        dirPath = options.dir;
    }
    else if (path_1.default.isAbsolute(process_1.default.argv[1])) {
        dirPath = path_1.default.join(process_1.default.argv[1], '..', options.dir);
    }
    else {
        dirPath = path_1.default.join(process_1.default.cwd(), process_1.default.argv[1], '..', options.dir);
    }
    if (!fs_1.default.existsSync(dirPath)) {
        var message = "".concat(exports.errorLabel, " dir ").concat(dirPath, " does not exists");
        log && console.error(message);
        throw new Error(message);
    }
    if (!fs_1.default.statSync(dirPath).isDirectory()) {
        var message = "".concat(exports.errorLabel, " dir ").concat(dirPath, " must be a directory");
        log && console.error(message);
        throw new Error(message);
    }
    // Save the mount option in the global config variable, so we don't need to pass it through scan and other recursive function calls
    configOptions.mount = (_b = options.mount) !== null && _b !== void 0 ? _b : '';
    try {
        scan(express, dirPath, '', options.log);
    }
    catch (error) {
        log && console.error(error.message);
        throw error;
    }
}
exports.default = default_1;
//# sourceMappingURL=index.js.map