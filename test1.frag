/*
{
"audio": true,
"IMPORTED": {
"img_00_Background": {
  "PATH": "./images/00_Background.png"
},
"img_01_EyeIn": {
  "PATH": "./images/01_EyeIn.png"
},
"img_02_EyeOut": {
  "PATH": "./images/02_EyeOut.png"
},
"img_03_JawSkin": {
  "PATH": "./images/03_JawSkin.png"
},
"img_04_Gencives": {
  "PATH": "./images/04_Gencives.png"
},
"img_06_TopTeeth": {
  "PATH": "./images/06_TopTeeth.png"
},
"img_07_TopSkin": {
  "PATH": "./images/07_TopSkin.png"
},
"img_08_Horns": {
  "PATH": "./images/08_Horns.png"
},
"img_09_Ears": {
  "PATH": "./images/09_Ears.png"
},
"img_10_Woods": {
  "PATH": "./images/10_Woods.png"
},
"img_11_Middle": {
  "PATH": "./images/11_Middle.png"
},
"img_12_Top2": {
  "PATH": "./images/12_Top2.png"
},
"img_13_Top": {
  "PATH": "./images/13_Top.png"
},
"noiseTex": {
  "PATH": "./images/Noise.png"
},
"outlineTex": {
  "PATH": "./images/Outline.png"
},
"mouthTexture": {
  "PATH": "./images/Mouth.png"
}
}
}

*/

precision mediump float;
uniform float time;
uniform vec2 resolution;

uniform sampler2D img_00_Background;
    uniform sampler2D img_01_EyeIn;
    uniform sampler2D img_02_EyeOut;
    uniform sampler2D img_03_JawSkin;
    uniform sampler2D img_04_Gencives;
    //uniform sampler2D img_05_LowerTeeth;
    uniform sampler2D img_06_TopTeeth;
    uniform sampler2D img_07_TopSkin;
    uniform sampler2D img_08_Horns;
    uniform sampler2D img_09_Ears;
    uniform sampler2D img_10_Woods;
    uniform sampler2D img_11_Middle;
    uniform sampler2D img_12_Top2;
    uniform sampler2D img_13_Top;
    //uniform sampler2D noiseTex;
    uniform sampler2D outlineTex;
    uniform sampler2D mouthTexture;
    uniform sampler2D spectrum;

    #define FFT(a) texture2D(spectrum, vec2(a, 0.)).x

#define sat(a) clamp(a, 0., 1.)
#define rot(a) mat2(cos(a), -sin(a), sin(a), cos(a))
#define PI acos(-1.)
float lightningPath(vec2 uv, float id)
{
   float freq = uv.y*220.*sin(uv.y*5.+id)+id*.1;
   return 0.02*asin(sin(freq*.1-time))
   +0.002*asin(sin(freq*2.+time*5.))
   +0.003*asin(sin(freq*.5+time));
}

vec3 rdrLightnings(vec2 uv)
{
    float an2 = atan(uv.y, uv.x);

    uv *= rot(asin(sin(an2*5.+length(uv)*25.-time*3.))*.07);
    vec3 col = vec3(0.);
    float an = atan(uv.y, uv.x);
    float stpa = PI/(5.);
    float id = floor((an+stpa*.5)/stpa);
    float sector = mod(an+stpa*.5,stpa)-stpa*.5;
    uv = vec2(sin(sector), cos(sector))*length(uv);
    float shape = abs(uv.x-lightningPath(uv, id))-.001;
    col = mix(col, vec3(1.), 1.-sat(shape*500.));
    col += vec3(0.65, 0.4, 0.81)*(1.-sat(shape*30.));
    col *= sat(fract(time*10.)*.5+.5);
    return col;
}


    vec3 rdrCirc(vec2 uv, float t)
    {
        vec3 col = vec3(0.);
        vec2 ouv = uv;
        float rep = .03;
        float id = floor((uv.y+rep*.5)/rep);
        uv.y = mod(uv.y+rep*.5,rep)-rep*.5;
        uv.x += id;
        float cl = .1;
        float h = clamp(asin(sin(uv.x*5.)), -cl, cl)/cl;
        float line = abs(uv.y-h*0.01)-.001;
        vec3 rgb = mix(vec3(.4,.3,.7), vec3(.4,.6,.9).zxy, sat(sin(id)));
        rgb *= 1.-sat((abs(ouv.x+(fract(id*.1)-.5)+mod(t*.75+.5*id,4.)-2.)-.2)*4.);
        col = mix(col, rgb,1.-sat(line*resolution.x*.5));
            col += .5*rgb*(1.-sat(line*80.));
        return col;
    }
    vec3 rdrCircuit(vec2 uv)
    {
        vec3 col = rdrCirc(uv, time);
        col += rdrCirc(uv+vec2(0.,.2), time*.7);
        col += .5*rdrCirc(2.*uv+vec2(0.,.1), time*.5).zxy;
        col += .15*rdrCirc(4.*uv+vec2(0.,.1), time*.25).yzx;
        return col;
    }
float lenny(vec2 v)
{
  return abs(v.x)+abs(v.y);
}

vec3 rdrmouth(vec2 uv)
{
  return vec3(1.,0.,0.)*.1;
}


vec3 draw_background(vec2 uv)
{
  vec3 col = vec3(0.);
  float shape = mix(length(uv), lenny(uv), -2.);
  col += vec3(1.)*((sin(shape*50.-time*5.)-.8))*2.;
  col = sat(col);
  col += vec3(.2,.2,.8);
  col += vec3(.2,.2,.8);
  float tex = 1.;//texture2D(noiseTex, fract(uv*vec2(1.,.2)-.5-vec2(sign(uv.x)*abs(uv.y)*.5,time*.01))).x;
  col = sat(col*(1.-pow(abs(uv.y), .2)))*sat((length(uv)-.1)*15.)*sat(1.-.2*tex);
  return col.xzy;
}

vec3 draw_ears(vec2 uv)
{
  vec2 ouv = uv;
  uv *= 3.;
  uv *= 1.-2.*length(uv-vec2(0.,.15));
  uv = uv * vec2(1.,.1);
  uv = fract(uv);
  return vec3(.5);
//  return pow(texture2D(noiseTex, uv).x, .25)*(1.-sat((length(ouv-vec2(0.,.2))-.1)*15.))+vec3(.1);
}

vec3 draw_bottomplate(vec2 uv)
{
  vec2 ouv = uv;
  uv *= 3.;
  uv *= 1.-2.*length(uv-vec2(0.,.15));
  uv = uv * vec2(1.,.1);
  uv = fract(uv);
  return vec3(.5);
//  return pow(texture2D(noiseTex, uv).x, .25)*(1.-sat((length(ouv-vec2(0.,-.2))-.0)*15.))+vec3(.1);
}

vec3 draw_eye(vec2 uv, float sz)
{
  float c = length(uv)-.045*sz;
  vec2 pos = uv+vec2(0.01*sin(time)*sz, sin(time*.67)*0.01*sz);
  float inn = length(pos)-0.02*sz;
  inn = max(inn, c);
  vec2 uvh = pos;
  float an = atan(uvh.y, uvh.x);
  uvh.x = abs(uvh.x);
  uvh.x -= -.012*sz+sz*0.003*abs(sin(time*.5));
  float hole = length(uvh)-0.02*sz-sz*0.0005*sin(uvh.y*1000.);
  hole = max(inn, -hole);

  vec3 col = vec3(0.);
  col = mix(col,  vec3(1.), 1.-sat(c*500.));
  col = mix(col, vec3(0.), 1.-sat(inn*500.));
  col = mix(col, vec3(0.23, 0.89, 0.47)*sat(sin(an*15.)*.3+.7), 1.-sat(hole*500.));
  return col*(1.-sat(length(pos)*10.))*2.;
}

vec3 rdrskin(vec2 uv)
{
  return vec3(0.39, 0.24, 0.76)*pow(1.-sat(length(uv-vec2(0.,.05))*12.), .35);
}

vec3 rdrwoods(vec2 uv)
{
  uv *= 3.;
  uv = abs(uv);
  uv.x *= -1.;
  uv *= rot(.65);
  return rdrCircuit(uv).xyz+vec3(.4)*sat(uv.y*3.+.75);
}

vec3 rdrhall(vec2 uv)
{
  uv*=rot(.1*time+length(uv)*.5);
  vec3 col=vec3(0.);

  float l = abs(sin(uv.y*30.+20.*sin(.5*time+uv.x*5.*length(uv*.2))))-2.3*(.1+.2*sin((uv.x+uv.y)*5.+time));

  col = mix(col,vec3(1.),1.-sat(l));
  return col;
}

vec3 rdrhall2(vec2 uv)
{
  float dist = (sin(-time*5.+(uv.x+uv.y)*5.)*.5+1.)*0.08;

  vec2 dir = normalize(vec2(1.));
  vec3 col;
  col.r = rdrhall(uv+dir*dist).r;
  col.g = rdrhall(uv).g;
  col.b = rdrhall(uv-dir*dist).b;
  return col;
}

vec3 rdrupplate(vec2 uv)
{
  uv = abs(uv);
  return rdrhall2(uv*15.);
}

vec3 rdrlowplate(vec2 uv)
{
  uv = abs(uv);
  return rdrhall2(uv*15.);
}

vec3 rdr(vec2 uvtex, vec2 uv)
{
  float colA = texture2D(img_00_Background, uvtex).x;
      float colB = texture2D(img_01_EyeIn, uvtex).x;
      float colC = texture2D(img_02_EyeOut, uvtex).x;
      float colD = texture2D(img_03_JawSkin, uvtex).x;
      float colE = texture2D(img_04_Gencives, uvtex).x;
      //float colF = texture2D(img_05_LowerTeeth, uvtex).x;
      float colG = texture2D(img_06_TopTeeth, uvtex).x;
      float colH = texture2D(img_07_TopSkin, uvtex).x;
      float colI = texture2D(img_08_Horns, uvtex).x;
      float colJ = texture2D(img_09_Ears, uvtex).x;
      float colK = texture2D(img_10_Woods, uvtex).x;
      float colL = texture2D(img_11_Middle, uvtex).x;
      float colM = texture2D(img_12_Top2, uvtex).x;
      float colN = texture2D(img_13_Top, uvtex).x;
      float colO = texture2D(mouthTexture, uvtex).x;//mouthTex

  vec3 col = vec3(0.);
  col += abs(uv.x*2.)*rdrCircuit(3.*uv*rot(acos(-1.)*.5))*0.;
  col += rdrLightnings(uv);

  col += draw_eye(uv-vec2(0.,0.165), 1.);
  vec2 offeye = vec2(-0.04,-0.012);
  vec3 eyetop = draw_eye(uv-vec2(0.,0.045), 0.35);
  vec3 eyel = draw_eye(uv+vec2(-offeye.x, offeye.y), 0.37);
  vec3 eyer = draw_eye(uv+vec2(offeye.x, offeye.y), 0.37);
  col += eyetop;
  col += eyel;
  col += eyer;

  col = mix(col, draw_background(uv), colA);
  col = mix(col, vec3(0.39, 0.24, 0.76)*.75, colB);
  col = mix(col, vec3(0.39, 0.24, 0.76)*.5, colC);
  col = mix(col, vec3(0.39, 0.24, 0.76)*.5, colD);
  col= mix(col, vec3(0.39, 0.24, 0.76), colE);
  //col= mix(col, vec3(1.), colF);
  col= mix(col, vec3(1.), colG);
  col= mix(col, rdrskin(uv), colH);
  col= mix(col, vec3(.8,.6,.6)*1.3, colI);
  col= mix(col, draw_ears(uv), colJ);
  col= mix(col, rdrwoods(uv), colK);
  col= mix(col, draw_bottomplate(uv), colL);
  col= mix(col, rdrlowplate(uv), colM);
  col= mix(col, rdrupplate(uv), colN);
  col= mix(col, rdrmouth(uv), colO);

float outline = texture2D(outlineTex, uvtex).x;
col = mix(col, vec3(.3,.7,.9)*sat(sin(length(uv)*10.-2.*time)), outline);
  return col;
}

vec3 rdr2(vec2 uvtex, vec2 uv)
{
  float t = time*.3+FFT(.1)*3.;
  vec2 shake = vec2(sin(t*.33), cos(t))*.02;
  uv += shake;
  uvtex += shake*1.5;
float rott = sin(t)*.02;
  uv *= rot(rott);
  uvtex *= rot(rott);
  vec2 off = vec2(0.02, 0.)*pow(FFT(abs(uv.y)*.15), 4.)*.5;
  vec3 col = vec3(0.);
  col.x = rdr(uvtex+off*1.5, uv+off).x;
  col.y = rdr(uvtex, uv).y;
  col.z = rdr(uvtex-off*1.5, uv-off).z;
  return col;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec2 uvsdf = (gl_FragCoord.xy-.5*resolution.xy)/resolution.xx;

    vec3 col = vec3(uv, 0.5 + 0.5 * sin(time))*.5;
    uv -= .5;
    uv *= vec2(1.5,1.);
    uv += .5;
    col = rdr2(uv, uvsdf);
    gl_FragColor = vec4(col, 1.0);
}
