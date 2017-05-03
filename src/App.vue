<template>

    <div id="vue_fb_cropper">


        <div class="file-selector" :class="{hidden: isStep(0)}" 
            @click="$refs.fileinput.click()" 
            @dragleave.prevent="" 
            @dragover.prevent="" 
            @dragenter.prevent="" 
            @drop.prevent="handleImage"
        >

            <input style="display: none" type="file" @change="handleImage" ref="fileinput" />

            <p>Select file</p>

        </div>


        <div class="vfc-container" v-if="step==1" :class="{hidden: isStep(1)}">
            <div class="vfcc-left">

                <div id="crop_canvas" :style="getCanvas">

                    <div 

                        class="cropbox" 

                        :style="getCropbox" 
                    >
                        <img 
                            class="cropbox-image" 

                            :src="image.img.src" 

                            :style="getCropboxImage"

                            @touchstart ="drag('touchStart', $event)" 

                            @touchmove="drag('touchMove', $event)" 

                            @mousedown="drag('dragStart', $event)" 

                            @mousemove="drag('dragMove', $event)" 

                            @mouseup="drag('dragEnd', $event)" 

                            @mouseout="drag('dragCheck', $event)" 

                            ref="cropboxImage"
                        >
                    </div>

                    <div 

                        class="drag-container" 

                        :style="getDragContainer" 

                        ref="dragContainer" 
                    >

                        <img
                            :src="image.img.src" 

                            :style="getDragImage"

                            class="drag-image" 

                            @touchstart ="drag('touchStart', $event)" 

                            @touchmove="drag('touchMove', $event)" 

                            @mousedown="drag('dragStart', $event)" 

                            @mousemove="drag('dragMove', $event)" 

                            @mouseup="drag('dragEnd', $event)" 

                            @mouseout="drag('dragCheck', $event)" 

                            ref="dragImage"
                        >

                    </div>
                </div>
                 <div class="slider">
                    <input class="range-slider form-control" type="range" :min="getMinValue()" :max="image.width" v-model.number="curImage.width" @input="resizeImage" step="10" />
                </div>
            </div>

            <div class="vfcc-right">
                <div class="preview">
                    <img :src="image.img.src" :style="getCropboxImage">
                </div>
            </div>
            <div class="vfcc-left">
               
            </div>
            <div class="vfcc-right"><button class="btn btn-primary" @click="setAvatar">Crop</button></div>
        </div>

        <div class="row" :class="{hidden: isStep(2)}">
            <div class="col-sm-12">

                <p>
                    <img :src="avatar" alt="">
                </p>

                <h4 class="text-success">Your profile picture has been saved.</h4>

            </div>
        </div>
    </div>

</template>

<script>

    import ImageHandler from './ImageHandler.js';

    import Dragger from './Dragger.js';

    export default {

        props: ['config'],

        data: function(){
            return {

                step: 0,

                avatar: null,

                image: new ImageHandler({max: 1000, min: 260}),

                dragger: new Dragger('.drag-image', [
                    'cropbox', 
                    'drag-container',
                    'cropbox-image',
                    'drag-image'
                ]),

                cropbox: {},

                curImage: {},

                cropboxImage: {width: 0, height: 0, top:0, left:0},

                dragImage: { width: 0, height: 0, left: 0, top:0},

                dragContainer: {width: 0, height: 0, left: 0, top: 0},

                diff_width: 0,

                diff_height: 0,

                show_cropper: false,

                upload_error: null
            }
        },

        methods: {

            isStep(step){
                return this.step !== step;
            },

            handleImage(e){

                e.preventDefault();

                let self = this;

                bus.$emit('overlay-loader-on');

                let files = e.target.files || e.dataTransfer.files;

                let file = files[0];

                e.target.value = null;

                // if not image, exit with error

                if(!this.image.isImage(file)){

                    bus.$emit('alert-on', {type: 'danger', message: 'Please Select a Valid JPG Or PNG Image'});

                    bus.$emit('overlay-loader-off');

                    return false;
                }

                bus.$emit('alert-off');

                this.image.onFileRead(file, this.onImageRead);

            },

            onImageRead(){

                let data = this.image.resize().fit().create({quality: .70});


                this.curImage = {width: this.image.width, height: this.image.height};

                if(this.curImage.width > this.config.canvas.width){

                    this.curImage.width = this.config.canvas.width;

                    this.curImage.height = (this.curImage.width / this.image.prop);
                }

                this.setDiffWidthHeight();

                this.step = 1;

                bus.$emit('alert-off');

                bus.$emit('overlay-loader-off');
            },

            drag(name, ev){
                
                this.dragger[name](ev);
            },            

            moveImage(ev){

                let left = this.dragger.drag_start.offsetX + ev.clientX - this.dragger.drag_start.clientX;

                //console.log('before: ' + this.dragImage.left)

                left = left < 0 ? 0 : left;

                left = left > this.diff_width ? this.diff_width : left;

                this.dragImage.left = left;

                //console.log('after: ' + this.dragImage.left)

                let top = this.dragger.drag_start.offsetY + ev.clientY - this.dragger.drag_start.clientY;

                top = top < 0 ? 0 : top;

                top = top > this.diff_height ? this.diff_height : top;

                this.dragImage.top = top;

            },

            getMinValue(){

               if(this.image.prop > 1) return this.config.cropbox.width * this.image.prop;

               return this.config.cropbox.width;
            },

            resizeImage(ev){

                this.curImage.height = this.curImage.width / this.image.prop;

                this.setDiffWidthHeight();

                this.dragImage.width = 0;
            },

            setDiffWidthHeight(){

                this.diff_width = this.curImage.width - this.config.cropbox.width;

                this.diff_height = this.curImage.height - this.config.cropbox.height;

            },

            setAvatar(e){

                e.preventDefault();

                bus.$emit('overlay-loader-on');

                self = this;

                let data = this.image.create({
                    canvas_width: this.cropbox.width,
                    canvas_height: this.cropbox.height,
                    width: this.cropboxImage.width,
                    height: this.cropboxImage.height,
                    top: this.cropboxImage.top,
                    left: this.cropboxImage.left

                });

                axios.post(this.config.url, {image: data}).then( response => {

                    self.step = 2;
                    self.avatar = response.data.image;

                    bus.$emit('alert-on', {type: 'success', message: 'Success'});

                    bus.$emit('overlay-loader-off');


                }).catch( error => {
                    
                    //console.log(error.response.data);

                    bus.$emit('alert-on', {type: 'danger', message: error.response.data.message});

                    bus.$emit('overlay-loader-off');

                });
            }
        },

        created(){

            
            this.cropbox.width = this.config.cropbox.width;

            this.cropbox.height = this.config.cropbox.height;

            this.cropbox.left = (this.config.canvas.width - this.cropbox.width) / 2;

            this.cropbox.top = (this.config.canvas.height - this.cropbox.height) / 2;

            bus.$on('move-image', this.moveImage);

        },

        computed: {

            getCanvas(){

              let obj = this.image.addPx(this.config.canvas);

              return obj;
            },

            getCropbox(){

                let obj = this.image.addPx(this.cropbox);

                return obj;
            },

            getCropboxImage(){

                // image offset in the crop box relative to drag image position

                // diff between resized bg image (drag) and cropbox size

                this.cropboxImage.width = this.curImage.width;

                this.cropboxImage.height = this.curImage.height;

                this.cropboxImage.top = this.dragImage.top - this.diff_height;

                this.cropboxImage.left = this.dragImage.left - this.diff_width;

                //this.generatePreview();

                return this.image.addPx(this.cropboxImage);

            },


            getDragContainer(){

                // sets the boundary for draggable

                this.dragContainer.width = this.curImage.width + (this.curImage.width - this.config.cropbox.width);

                this.dragContainer.height = this.curImage.height + (this.curImage.height - this.config.cropbox.height);

                this.dragContainer.left = (this.config.canvas.width - this.dragContainer.width) / 2;

                this.dragContainer.top = (this.config.canvas.height - this.dragContainer.height) / 2;

                return this.image.addPx(this.dragContainer);
            },

            getDragImage(){

                // .crop-image-overlay = draggable positions

                if(this.dragImage.width==0){

                    this.dragImage.width = this.curImage.width;

                    this.dragImage.height = this.curImage.height;

                    this.dragImage.left = (this.dragContainer.width -  this.curImage.width) / 2;

                    this.dragImage.top = (this.dragContainer.height -  this.curImage.height) / 2;
                }


                return this.image.addPx(this.dragImage);
            }

            
        },

        mounted(){
            
        }
    }

</script>

<style>

    .vfc-container{
        width: 100%;
        box-sizing: border-box;
    }

    .vfc-container:after{
        content: "";
        display: table;
        clear: both;
    }

    .vfcc-right,
    .vfcc-left{
        float: left;
        box-sizing: border-box;
    }

    .vfcc-left{
        width: 70%;
    }

    .vfcc-right{
        width: 30%;
    }

    .hidden{
        display: none;
    }
    
    .slider{
        width: 100%;
        text-align: center;
    }


    #crop_canvas{
        margin: 0 auto;
        width: 600px;
        height: 400px;
        position: relative;
        overflow: hidden;
        background: #eee;
        box-shadow: inset 2px 2px 2px #ddd;
        border: 1px solid #ddd;
        cursor: move;
    }

    .cropbox,
    .preview{
        position: absolute;
        width: 260px;
        height: 260px;
        overflow: hidden;
        z-index: 1;
    }

    .cropbox{
        outline: 8px solid rgba(255, 255, 255, 0.55);
    }

    .preview{
        outline: 8px solid #ddd;
    }

    .cropbox-image,
    .preview img{
        position: absolute;
    }

    .drag-container{
        outline: 4px solid silver;
        position: absolute;
        opacity: 0.3;
    }

    .drag-image{
        position: relative;
        background-size: 100% 100%;
    }

    /*
    ===================================
    FILE SELECTOR
    ===================================
    */

    .file-selector{
        border: 1px dashed silver;

        background: #fefefe;

        padding: 30px;

        width: 100%;

        margin: auto;

        text-align: center;

    }

    .range-slider{
        width: 100%;
    }

</style>