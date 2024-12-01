let images = [
  "00_Background.png",
"01_EyeIn.png",
"02_EyeOut.png",
"03_JawSkin.png",
"04_Gencives.png",
"05_LowerTeeth.png",
"06_TopTeeth.png",
"07_TopSkin.png",
"08_Horns.png",
"09_Ears.png",
"10_Woods.png",
"11_Middle.png",
"12_Top2.png",
"13_Top.png"
];


function strip_name(name) {
  return name.replace(/\.[^/.]+$/, "")
}

let str = "";
let uniform = "";
let sample = "";
let sample2 = "";

for (let i = 0; i < images.length; ++i)
{
  let img = images[i];
  let uniformName = `img_${strip_name(img)}`;
  str += `
      "${uniformName}": {
        "PATH": "./images/${img}"
      },`
    uniform += `uniform sampler2D ${uniformName};
    `;
    sample += `float col${String.fromCharCode(i+65)} = texture2D(${uniformName}, uvtex).x;
    ` // 65 is A

    sample2 += `col= mix(col, vec3(1., .5, .5), col${String.fromCharCode(i+65)});
    ` // 65 is A
}

console.log(str);
console.log(uniform);
console.log(sample);
console.log(sample2);
