export default class ImageHandler{
    
    constructor(opt){

        this.img = null;

        this.src = null;

        this.width = null;

        this.height = null;

        this.prop = 1;

        this.opt = opt;
    }

    isImage(file){
        return file.type.indexOf('image') > -1; 
    }

    onFileRead(file, callback){

        this.origFileName = file.name;

        this.origFileSize = file.size;

        self = this;

        let reader = new FileReader();

        reader.onload = function(event){

            self.onLoadImage(event.target.result, callback);
        }

        reader.readAsDataURL(file);
    }


    onLoadImage(src, callback=null){

        let img = new Image();

        let self = this;

        img.onload = function(){

            self.img = img;

            self.prop = img.naturalWidth / img.naturalHeight;

            self.width = img.naturalWidth;

            self.height = img.naturalHeight;

            if(callback) callback(img);
        }

        img.src = src;
    }

    create(opt={}){

        img = opt.hasOwnProperty('img') ? opt.img : this.img;

        opt.width = opt.hasOwnProperty('width') ? opt.width : this.width;

        opt.height = opt.hasOwnProperty('height') ? opt.height : this.height;

        opt.top = opt.hasOwnProperty('top') ? opt.top : 0;

        opt.left = opt.hasOwnProperty('left') ? opt.left : 0;

        opt.quality = opt.hasOwnProperty('quality') ? opt.quality : 100;

        let cvs = document.createElement('canvas');

        cvs.width = opt.hasOwnProperty('canvas_width') ? opt.canvas_width : opt.width;

        cvs.height = opt.hasOwnProperty('canvas_height') ? opt.canvas_height : opt.height;

        let ctx = cvs.getContext("2d");

        ctx.drawImage(img, opt.left, opt.top, opt.width, opt.height);

        let data = cvs.toDataURL('image/jpeg', opt.quality);

        this.setSize(data);

        let img = new Image();

        let self = this;

        img.onload = function(){
            self.img = img;
        }

        img.src = data;

        return data;
    }

    setSize(data){

        let head = 'data:image/jpeg;base64,';

        let size = Math.round((data.length - head.length)*3/4) ;

        this.size = size;
    }

    resize(){

        if(this.prop >= 1){
            this.width = this.width > this.opt.max ? this.opt.max : this.width;
            this.height = this.width / this.prop;
        }else{
            this.height = this.height > this.opt.max ? this.opt.max : this.height;

            this.width = this.height * this.prop;
        }

        return this;
    }

    fit(){
        if(Math.max(this.width, this.height) < this.opt.min){

            if(this.prop >= 1){
                this.height = this.opt.min;
                this.width = this.height * this.prop;
            }else{
                this.width = this.opt.min;
                this.height = this.width / this.prop;
            }
        }

        return this;
    }

    fitCover(){

        let canvas_prop = this.opt.width / this.opt.height;

        if(this.prop ==1){
            this.width = this.height = this.opt.width;
        }else if(this.prop < 1){
            this.width = this.opt.width;
            this.height = this.width / this.prop;
        }else if(this.prop > 1 && this.prop <= canvas_prop){

            this.width = this.opt.width;

            this.height = this.width / this.prop;

        }else if(this.prop > canvas_prop){

            let prop = this.opt.height / this.height;

            this.height = this.opt.height;

            this.width = this.width * prop; 
        }

        return this;

    }

    addPx(obj){
        let o = {};

        o.width = obj.width + 'px';

        o.height = obj.height + 'px';

        if(obj.hasOwnProperty('top')) o.top = obj.top + 'px';

        if(obj.hasOwnProperty('left')) o.left = obj.left + 'px';

        return o;
    }
}