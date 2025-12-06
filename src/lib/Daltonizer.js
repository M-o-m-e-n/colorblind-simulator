// Daltonizer: minimal WebGL helper class
export default class Daltonizer {
    constructor(canvas) {
        this.canvas = canvas
        const gl = canvas.getContext('webgl', { preserveDrawingBuffer: false })
        if (!gl) throw new Error('WebGL not available')
        this.gl = gl
        this._init()
    }

    _init() {
        const gl = this.gl
        // Flip incoming video textures vertically so the rendered image matches the camera preview.
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
        const vs = `
      attribute vec2 a_pos;
      attribute vec2 a_uv;
      varying vec2 v_uv;
      void main(){ v_uv = a_uv; gl_Position = vec4(a_pos,0.0,1.0); }
    `
        const fs = `
      precision mediump float;
      uniform sampler2D u_texture;
      uniform mat3 u_colorMatrix;
      uniform float u_mix;
      varying vec2 v_uv;
      void main(){
        vec4 c = texture2D(u_texture, v_uv);
        vec3 sim = u_colorMatrix * c.rgb;
        vec3 outColor = mix(c.rgb, sim, u_mix);
        gl_FragColor = vec4(outColor, c.a);
      }
    `
        const vert = this._compile(gl.VERTEX_SHADER, vs)
        const frag = this._compile(gl.FRAGMENT_SHADER, fs)
        const prog = gl.createProgram()
        gl.attachShader(prog, vert)
        gl.attachShader(prog, frag)
        gl.linkProgram(prog)
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            throw new Error('Program link error: ' + gl.getProgramInfoLog(prog))
        }
        gl.useProgram(prog)
        this.program = prog
        this.attrs = {
            pos: gl.getAttribLocation(prog, 'a_pos'),
            uv: gl.getAttribLocation(prog, 'a_uv')
        }
        this.unis = {
            tex: gl.getUniformLocation(prog, 'u_texture'),
            cm: gl.getUniformLocation(prog, 'u_colorMatrix'),
            mix: gl.getUniformLocation(prog, 'u_mix')
        }

        // VBO (pos + uv)
        const verts = new Float32Array([
            -1, -1, 0, 0,
            1, -1, 1, 0,
            -1, 1, 0, 1,
            -1, 1, 0, 1,
            1, -1, 1, 0,
            1, 1, 1, 1
        ])
        this.vbo = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW)
        const stride = 4 * Float32Array.BYTES_PER_ELEMENT
        gl.enableVertexAttribArray(this.attrs.pos)
        gl.vertexAttribPointer(this.attrs.pos, 2, gl.FLOAT, false, stride, 0)
        gl.enableVertexAttribArray(this.attrs.uv)
        gl.vertexAttribPointer(this.attrs.uv, 2, gl.FLOAT, false, stride, 2 * Float32Array.BYTES_PER_ELEMENT)

        // texture
        this.tex = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    }

    _compile(type, src) {
        const gl = this.gl
        const s = gl.createShader(type)
        gl.shaderSource(s, src)
        gl.compileShader(s)
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            throw new Error('Shader compile error: ' + gl.getShaderInfoLog(s))
        }
        return s
    }

    updateSize(w, h) {
        if (this.canvas.width !== w || this.canvas.height !== h) {
            this.canvas.width = w
            this.canvas.height = h
            this.gl.viewport(0, 0, w, h)
        }
    }

    updateVideoFrame(video) {
        const gl = this.gl
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        try { gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video) }
        catch (e) { /* some browsers/platforms may throw; ignore */ }
    }

    render({ matrix = [1, 0, 0, 0, 1, 0, 0, 0, 1], mix = 1 }) {
        const gl = this.gl
        gl.useProgram(this.program)
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, this.tex)
        gl.uniform1i(this.unis.tex, 0)
        gl.uniformMatrix3fv(this.unis.cm, false, new Float32Array(matrix))
        gl.uniform1f(this.unis.mix, mix)
        gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    destroy() {
        const gl = this.gl
        if (!gl) return
        if (this.tex) gl.deleteTexture(this.tex)
        if (this.vbo) gl.deleteBuffer(this.vbo)
        // program/shaders cleanup omitted for brevity
    }
}
