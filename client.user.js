// ==UserScript==
// @name         KrunkerXD
// @namespace    https://github.com/GeniusXD
// @version      1.8.9
// @description  The best krunker cheat
// @author       Improved and unpatched by 200botsga
// @match        *://krunker.io/*
// @run-at       document-start
// @require      https://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js
// @require      https://krunkr.com/assets/js/canvas.gui.js?ver=0.7
// @icon64       https://hdwallpaper20.com/wp-content/uploads/data/2018/3/5/wolf-PIC-HWB317337-1024x576.jpg
// @icon64URL    https://hdwallpaper20.com/wp-content/uploads/data/2018/3/5/wolf-PIC-HWB317337-1024x576.jpg
// @icon         https://hdwallpaper20.com/wp-content/uploads/data/2018/3/5/wolf-PIC-HWB317337-1024x576.jpg
// @grant        none
// ==/UserScript==

(function() {
    const replace = String.prototype.replace;
    const original_call = Function.prototype.call;

    let anti_map = [];

    const original_toString = Function.prototype.toString;
    let hook_toString = new Proxy(original_toString, {
        apply: function(target, _this, _arguments) {
            for (var i = 0; i < anti_map.length; i++) {
                if (anti_map[i].from === _this) {
                    return target.apply(anti_map[i].to, _arguments);
                }
            }
            return target.apply(_this, _arguments);
        }
    });
    anti_map.push({from: hook_toString, to: original_toString});
    Function.prototype.toString = hook_toString;

    let conceal_function = function(original_Function, hook_Function) {
        anti_map.push({from: hook_Function, to: original_Function});
    };

    let hidden_globals = [];
    const original_getOwnPropertyDescriptors = Object.getOwnPropertyDescriptors;
    let hook_getOwnPropertyDescriptors = new Proxy(original_getOwnPropertyDescriptors, {
        apply: function(target, _this, _arguments) {
            let descriptors = target.apply(_this, _arguments);
            for (var i = 0; i < hidden_globals.length; i++) {
                delete descriptors[hidden_globals[i]];
            }
            return descriptors;
        }
    });
    Object.getOwnPropertyDescriptors = hook_getOwnPropertyDescriptors;
    conceal_function(original_getOwnPropertyDescriptors, hook_getOwnPropertyDescriptors);

    let invisible_define = function(obj, key, value) {
        hidden_globals.push(key);
        Object.defineProperty(obj, key, {
            enumberable: false,
            configurable: false,
            writable: true,
            value: value
        });
    };

    let global_invisible_define = function(key, value) {
        invisible_define(window, key, value);
    };

    let keyMap = {};
    let genKey = function() {
        let a = new Uint8Array(20);
        crypto.getRandomValues(a);
        return 'hrt'+Array.from(a,x=>('0'+x.toString(16)).substr(-2)).join('');
    }

    keyMap['init'] = genKey();
    global_invisible_define(keyMap['init'], false);

    let drawVisuals = function() {};
    const original_clearRect = CanvasRenderingContext2D.prototype.clearRect;
    let hook_clearRect = new Proxy(original_clearRect, {
        apply: function(target, _this, _arguments) {
            target.apply(_this, _arguments);
            drawVisuals(_this);
        }
    });
    conceal_function(original_clearRect, hook_clearRect);
    CanvasRenderingContext2D.prototype.clearRect = hook_clearRect;

    let hrtCheat = function(me, inputs, world, consts, math, canSee, pchObjc, objInstances, isYou, recoilAnimY, mouseDownL, mouseDownR) {
        let controls = world.controls;
        if (controls.scrollDelta) {
            controls.skipScroll = controls.scrollToSwap;
            if (!controls.scrollToSwap) {
                controls.fakeKey(0x4e20,0x1);
            }
        }
        controls.scrollDelta = 0;
        controls.wSwap = 0;

        const playerHeight = 11;
        const crouchDst = 3;
        const headScale = 2;
        const hitBoxPad = 1;
        const armScale = 1.3;
        const chestWidth = 2.6;
        const armInset = -.1;
        const playerScale = (2 * armScale + chestWidth + armInset) / 2;
        const SHOOT = 5, SCOPE = 6, xDr = 3, yDr = 2, JUMP = 7, CROUCH = 8;
        let isEnemy = function(player) {return !me.team || player.team != me.team};
        let canHit = function(player) {return null == world[canSee](me, player.x3, player.y3 - player.crouchVal * crouchDst, player.z3)};
        let normaliseYaw = function(yaw) {return (yaw % Math.PI2 + Math.PI2) % Math.PI2;};
        let getDir = function(a, b, c, d) {
            return Math.atan2(b - d, a - c);
        };
        let getD3D = function(a, b, c, d, e, f) {
            let g = a - d, h = b - e, i = c - f;
            return Math.sqrt(g * g + h * h + i * i);
        };
        let getXDire = function(a, b, c, d, e, f) {
            let g = Math.abs(b - e), h = getD3D(a, b, c, d, e, f);
            return Math.asin(g / h) * (b > e ? -1 : 1);
        };

        let dAngleTo = function(x, y, z) {
            let ty = normaliseYaw(getDir(controls.object.position.z, controls.object.position.x, z, x));
            let tx = getXDire(controls.object.position.x, controls.object.position.y, controls.object.position.z, x, y, z);
            let oy = normaliseYaw(controls.object.rotation.y);
            let ox = controls[pchObjc].rotation.x;
            let dYaw = Math.min(Math.abs(ty - oy), Math.abs(ty - oy - Math.PI2), Math.abs(ty - oy + Math.PI2));
            let dPitch = tx - ox;
            return Math.hypot(dYaw, dPitch);
        };
        let calcAngleTo = function(player) {return dAngleTo(player.x3, player.y3 + playerHeight - (headScale + hitBoxPad) / 2 - player.crouchVal * crouchDst, player.z3);};
        let calcDistanceTo = function(player) {return getD3D(player.x3, player.y3, player.z3, me.x, me.y, me.z)};
        let isCloseEnough = function(player) {let distance = calcDistanceTo(player); return me.weapon.range >= distance && ("Shotgun" != me.weapon.name || distance < 70) && ("Akimbo Uzi" != me.weapon.name || distance < 100);};
        let haveAmmo = function() {return !(me.ammos[me.weaponIndex] !== undefined && me.ammos[me.weaponIndex] == 0);};

        let closest = null, closestAngle = Infinity;
        let players = world.players.list;
        for (var i = 0; me.active && i < players.length; i++) {
            let e = players[i];
            if (e[isYou] || !e.active || !e[objInstances] || !isEnemy(e)) {
                continue;
            }

            e.x3 = e.x;
            e.y3 = e.y;
            e.z3 = e.z;

            if (!isCloseEnough(e) || !canHit(e)) {
                continue;
            }

            let angle = calcAngleTo(e);
            if (angle < closestAngle) {
                closestAngle = angle;
                closest = e;
            }
        }

        let ty = controls.object.rotation.y, tx = controls[pchObjc].rotation.x;
        if (closest) {
            let target = closest;
            let y = target.y3 + playerHeight - (headScale) / 2 - target.crouchVal * crouchDst;
            if (me.weapon.nAuto && me.didShoot) {
                inputs[SHOOT] = 0;
            } else if (!me.aimVal) {
                inputs[SHOOT] = 1;
                inputs[SCOPE] = 1;
            } else {
                inputs[SCOPE] = 1;
            }

            ty = getDir(controls.object.position.z, controls.object.position.x, target.z3, target.x3);
            tx = getXDire(controls.object.position.x, controls.object.position.y, controls.object.position.z, target.x3, y, target.z3);

            tx -= .3 * me[recoilAnimY];
        } else {
            inputs[SHOOT] = controls[mouseDownL];
            inputs[SCOPE] = controls[mouseDownR];
        }

        inputs[xDr] = (tx % Math.PI2).round(3);
        inputs[yDr] = (ty % Math.PI2).round(3);

        controls.keys[controls.reloadKey] = !haveAmmo() * 1;

        inputs[JUMP] = (controls.keys[controls.jumpKey] && !me.didJump) * 1;

        if (!window[keyMap['init']]) {
            window[keyMap['init']] = true;

            drawVisuals = function(c) {
                let scalingFactor = arguments.callee.caller.caller.arguments[0];
                let perspective = arguments.callee.caller.caller.arguments[2];
                let scaledWidth = c.canvas.width / scalingFactor;
                let scaledHeight = c.canvas.height / scalingFactor;
                let worldPosition = perspective.camera.getWorldPosition();
                for (var i = 0; i < world.players.list.length; i++) {
                    let player = world.players.list[i];
                    let e = players[i];
                    if (e[isYou] || !e.active || !e[objInstances] || !isEnemy(e)) {
                        continue;
                    }

                    let xmin = Infinity;
                    let xmax = -Infinity;
                    let ymin = Infinity;
                    let ymax = -Infinity;
                    let br = false;
                    for (var j = -1; !br && j < 2; j+=2) {
                        for (var k = -1; !br && k < 2; k+=2) {
                            for (var l = 0; !br && l < 2; l++) {
                                let position = e[objInstances].position.clone();
                                position.x += j * playerScale;
                                position.z += k * playerScale;
                                position.y += l * (playerHeight - e.crouchVal * crouchDst);
                                if (!perspective.frustum.containsPoint(position)) {
                                    br = true;
                                    break;
                                }
                                position.project(perspective.camera);
                                xmin = Math.min(xmin, position.x);
                                xmax = Math.max(xmax, position.x);
                                ymin = Math.min(ymin, position.y);
                                ymax = Math.max(ymax, position.y);
                            }
                        }
                    }

                    if (br) {
                        continue;
                    }

                    xmin = (xmin + 1) / 2;
                    ymin = (ymin + 1) / 2;
                    xmax = (xmax + 1) / 2;
                    ymax = (ymax + 1) / 2;


                    c.save();
                    const original_strokeStyle = c.strokeStyle;
                    const original_lineWidth = c.lineWidth;
                    const original_font = c.font;
                    const original_fillStyle = c.fillStyle;

                    c.lineWidth = 5;
                    c.strokeStyle = 'rgba(255,50,50,1)';

                    let distanceScale = Math.max(.3, 1 - getD3D(worldPosition.x, worldPosition.y, worldPosition.z, e.x, e.y, e.z) / 600);
                    c.scale(distanceScale, distanceScale);
                    let xScale = scaledWidth / distanceScale;
                    let yScale = scaledHeight / distanceScale;

                    c.beginPath();
                    ymin = yScale * (1 - ymin);
                    ymax = yScale * (1 - ymax);
                    xmin = xScale * xmin;
                    xmax = xScale * xmax;
                    c.moveTo(xmin, ymin);
                    c.lineTo(xmin, ymax);
                    c.lineTo(xmax, ymax);
                    c.lineTo(xmax, ymin);
                    c.lineTo(xmin, ymin);
                    c.stroke();

                    c.fillStyle = "rgba(255,50,50,1)";
                    let barMaxHeight = ymax - ymin;
                    c.fillRect(xmin - 7, ymin, -10, barMaxHeight);
                    c.fillStyle = "#00FFFF";
                    c.fillRect(xmin - 7, ymin, -10, barMaxHeight * (e.health / e.maxHealth));

                    c.font = "60px Sans-serif";
                    c.fillStyle = "white";
                    c.strokeStyle='black';
                    c.lineWidth = 1;
                    let x = xmax + 7;
                    let y = ymax;
                    c.fillText(e.name, x, y);
                    c.strokeText(e.name, x, y);
                    c.font = "30px Sans-serif";
                    y += 35;
                    c.fillText(e.weapon.name, x, y);
                    c.strokeText(e.weapon.name, x, y);
                    y += 35;
                    c.fillText(e.health + ' HP', x, y);
                    c.strokeText(e.health + ' HP', x, y);

                    c.strokeStyle = original_strokeStyle;
                    c.lineWidth = original_lineWidth;
                    c.font = original_font;
                    c.fillStyle = original_fillStyle;
                    c.restore();

                    if (e.legMeshes[0]) {
                        let material = e.legMeshes[0].material;
                        material.alphaTest = 1;
                        material.depthTest = false;
                        material.fog = false;
                        material.emissive.r = 1;
                        material.emissive.g = 1;
                        material.emissive.b = 1;
                        material.wireframe = true;
                    }

                }
            };
        };
    };
    keyMap['hrtCheat'] = genKey();
    global_invisible_define(keyMap['hrtCheat'], hrtCheat);

    const handler = {
      construct(target, args) {
        if (args.length == 2 && args[1].length > 1337) {
            let script = args[1];

var xd = `<head>
<link href="https://fonts.googleapis.com/css?family=Quicksand|Roboto" rel="stylesheet">
<script src="https://pastebin.com/raw/kY6xyYd4"></script>
<link rel="icon" type="image/png" href="https://cdn.codetunnel.net/ahub/logo-transparent.png" />
    <style type="text/css">
        * {
            margin: 0;
            padding: 0;
        }

        body {
            font-size: 8px;
            background-color: #3f51b5;
        }

        @media screen and (min-width: 220px) {
            body {
                font-size: 14px;
            }
        }

        @media screen and (min-width: 520px) {
            body {
                font-size: 18px;
            }
        }

        h1 {
            font-size: 2em;
            font-family: Quicksand, Roboto, Arial;
            font-weight: 100;
            color: #424242;
            margin: 1rem;
        }

        p {
            font-family: Roboto, Quicksand, Arial;
            text-align: left;
            margin-bottom: 1rem;
        }

        a {
            text-decoration: none;
            color: #3f51b5;
        }

        .message-container {
            box-sizing: border-box;
            background-color: #FFFFFF;
            margin: auto;
            width: 90%;
            max-width: 42em;
            margin-top: -30vh;
            padding: 1em;
            border-radius: 2px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, .14), 0 1px 10px 0 rgba(0, 0, 0, .12), 0 2px 4px -1px rgba(0, 0, 0, .2);
        }

        .ribbon {
            width: 100%;
            height: 40vh;
            background-color: #3f51b5;
        }

        .button {
            background-color: #3f51b5;
            border: none;
            color: white;
            padding: 15px 32px;
            text-align: center;
            text-decoration: none;
            display: inline-block;
            font-size: 16px;
            margin: 4px 2px;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div class="ribbon"></div>
    <div class="message-container">
<script>
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
}, false);
</script>
        <h1>
            <center>Outdated Cheat Detected!</center>
        </h1>

<center><button class="button" onclick="git()">Github</button></center>
<script>
function git() {
window.open("https://github.com/GeniusXD/KrunkerXD", '_self')
}
</script>
<br><center><iframe width="725" height="409" src="https://www.youtube.com/embed/Q3HSjJ9lRF4" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></center></br>

    </div>
</body>`

             var version = script.match(/\w+\['exports'\]=(0[xX][0-9a-fA-F]+);/)[1];
             var fstyle = "0x597b";
             if (version !== fstyle) {
                document.write(xd);
             }

            var canSee = "'"+script.match(/,this\['(\w+)'\]=function\(\w+,\w+,\w+,\w+,\w+\){if\(!\w+\)return!\w+;/)[1]+"'";
            var pchObjc = "'"+script.match(/\(\w+,\w+,\w+\),this\['(\w+)'\]=new \w+\['\w+'\]\(\)/)[1]+"'";
            var objInstances = "'"+script.match(/\[\w+\]\['\w+'\]=!\w+,this\['\w+'\]\[\w+\]\['\w+'\]&&\(this\['\w+'\]\[\w+\]\['(\w+)'\]\['\w+'\]=!\w+/)[1]+"'";
            var isYou = "'"+script.match(/,this\['\w+'\]=!\w+,this\['\w+'\]=!\w+,this\['(\w+)'\]=\w+,this\['\w+'\]\['length'\]=\w+,this\[/)[1]+"'";
            var recoilAnimY = "'"+script.match(/\w*1,this\['\w+'\]=\w*0,this\['\w+'\]=\w*0,this\['\w+'\]=\w*1,this\['\w+'\]=\w*1,this\['\w+'\]=\w*0,this\['\w+'\]=\w*0,this\['(\w+)'\]=\w*0,this\['\w+'\]=\w*0,this\['\w+'\]=\w*0,this\['\w+'\]=\w*0,/)[1]+"'";
            var mouseDownL = "'"+script.match(/this\['\w+'\]=function\(\){this\['(\w+)'\]=\w*0,this\['(\w+)'\]=\w*0,this\['\w+'\]={}/)[1]+"'";
            var mouseDownR = "'"+script.match(/this\['\w+'\]=function\(\){this\['(\w+)'\]=\w*0,this\['(\w+)'\]=\w*0,this\['\w+'\]={}/)[2]+"'";

            var inputs = script.match(/\(\w+,\w*1\)\),\w+\['\w+'\]=\w*0,\w+\['\w+'\]=\w*0,!(\w+)\['\w+'\]&&\w+\['\w+'\]\['push'\]\((\w+)\),(\w+)\['\w+'\]/)[2];
            var world = script.match(/\(\w+,\w*1\)\),\w+\['\w+'\]=\w*0,\w+\['\w+'\]=\w*0,!(\w+)\['\w+'\]&&\w+\['\w+'\]\['push'\]\((\w+)\),(\w+)\['\w+'\]/)[1];
            var consts = script.match(/\w+\['\w+'\]\),\w+\['\w+'\]\(\w+\['\w+'\],\w+\['\w+'\]\+\w+\['\w+'\]\*(\w+)/)[1];
            var me = script.match(/\(\w+,\w*1\)\),\w+\['\w+'\]=\w*0,\w+\['\w+'\]=\w*0,!(\w+)\['\w+'\]&&\w+\['\w+'\]\['push'\]\((\w+)\),(\w+)\['\w+'\]/)[3];
            var math = script.match(/\\x20\-50\%\)\\x20rotate\('\+\((\w+)\['\w+'\]\(\w+\[\w+\]\['\w+'\]/)[1];


            const code_to_overwrite = script.match(/(\w+\['\w+'\]&&\(\w+\['\w+'\]=\w+\['\w+'\],!\w+\['\w+'\]&&\w+\['\w+'\]\(\w+,\w*1\)\),\w+\['\w+'\]=\w*0,\w+\['\w+'\]=\w*0),!\w+\['\w+'\]&&\w+\['\w+'\]\['push'\]\(\w+\),\w+\['\w+'\]\(\w+,\w+,!\w*1,\w+\['\w+'\]\)/)[1];
            const ttapParams = [me, inputs, world, consts, math, canSee, pchObjc, objInstances, isYou, recoilAnimY, mouseDownL, mouseDownR].toString();
            let call_hrt = `window['` + keyMap['hrtCheat'] + `'](` + ttapParams + `)`;

            while (call_hrt.length < code_to_overwrite.length) {
                call_hrt += ' ';
            }

            const hooked_call = Function.prototype.call;
            Function.prototype.call = original_call;

            script = replace.call(script, code_to_overwrite, call_hrt);

            script = replace.call(script, /\w+\['weapon'\]&&\w+\['weapon'\]\['trail'\]/g, "true")

            script = replace.call(script, /#9eeb56/g, '#00FFFF');

            script = replace.call(script, /,'zoom':.+?(?=,)/g, ",'zoom':1");

            Function.prototype.call = hooked_call;

            const original_script = args[1];
            args[1] = script;
            let mod_fn = new target(...args);
            args[1] = original_script;
            let original_fn = new target(...args);
            conceal_function(original_fn, mod_fn);
            return mod_fn;
        }
        return new target(...args);
      }
    };

function UI() {
document.getElementById("merchHolder").innerHTML = `<div id="merchHolder" onclick="openURL('https://github.com/GeniusXD')">
<img id="merchImg" src="https://www.whatsappprofiledpimages.com/wp-content/uploads/2018/07/cool-profile-pictures2-291x300.jpg">
</div>`
};

    function setGUI() {


    document.getElementById("aContainer").innerHTML = `<div class="neon">
  <span class="text" data-text="thanks"><center>krunkerxd</center></span>
  <span class="gradient"></span>
  <span class="spotlight"></span>
</div>`;
        document.getElementsByTagName('head')[0].innerHTML += `<style type="text/css">
body {
    margin: 0;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: black;
}

.neon {
    position: relative;
    overflow: hidden;
    filter: brightness(200%);
}

.text {
    background-color: black;
    color: white;
    font-size: 60px;
    font-weight: bold;
    font-family: sans-serif;
    text-transform: uppercase;
    position: relative;
    user-select: none;
}

.text::before {
    content: attr(data-text);
    position: absolute;
    color: white;
    filter: blur(0.02em);
    mix-blend-mode: difference;
}

.gradient {
    position: absolute;
    background: linear-gradient(45deg, red, gold, lightgreen, gold, red);
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    mix-blend-mode: multiply;
}

.spotlight {
    position: absolute;
    top: -100%;
    left: -100%;
    right: 0;
    bottom: 0;
    background:
        radial-gradient(
            circle,
            white,
            transparent 25%
        ) center / 25% 25%,
        radial-gradient(
            circle,
            white,
            black 25%
        ) center / 12.5% 12.5%;
    animation: light 5s linear infinite;
    mix-blend-mode: color-dodge;
}

@keyframes light {
    to {
        transform: translate(50%, 50%);
    }
}

</style>`
    }

    const original_Function = Function;
    let hook_Function = new Proxy(Function, handler);
    conceal_function(original_Function, hook_Function);
    Function = hook_Function;
    UI();
    setGUI();
    console.log("Injected KrunkerXD v1.8.9!");
    alert('KrunkerXD\nCheats for Krunker.io v1.8.9\n\nThis cheat/hack was unpatched and improved by 200bots.ga. Please disable Ad-blocker for better gameplay!\n\nAlert: You may get banned! If you get banned, you have no rights to blame us!');
})()
