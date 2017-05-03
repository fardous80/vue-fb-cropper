export default class Dragger{
    constructor(el, drag_elements){

        this.el = el;

        // elements [div, classes, etc] on dragging allowed

        this.drag_elements = drag_elements;

        this.dragging = false;

        this.drag_start = {};
    }

    onDragStart(ev){

        let el = document.querySelector(this.el);

        this.drag_start.offsetX = parseInt(el.style.left);

        this.drag_start.clientX = ev.clientX;

        this.drag_start.offsetY = parseInt(el.style.top);

        this.drag_start.clientY = ev.clientY;

    }

    onDrag(ev){

        //this.moveImage(ev);

        bus.$emit('move-image', ev);

        return false;
    }

    dragStart(ev){
        ev.preventDefault();

        this.dragging = true;
        
        this.onDragStart(ev);

        return false;
    }

    dragMove(ev){
        ev.preventDefault();

        if(!this.dragging) return false;

        this.onDrag(ev);

        return false;
    }

    dragEnd(ev){

        ev.preventDefault();

        this.dragging = false;

        this.drag_start = {};

        return false;
    }

    dragCheck(ev){

        ev.preventDefault();
        
        //let classes = ['drag-image', 'drag-helper'];

        if(this.drag_elements.indexOf(ev.toElement.className) > -1){
            if(!this.dragging) return false;
            this.onDrag(ev);
        }else{
            this.dragging = false;
            this.drag_start = {};
            return false;
        }
    }

    touchStart(ev){
        ev.preventDefault();

        var touches = ev.changedTouches[0];

        this.onDragStart(touches);


    }

    touchEnd(ev){
        ev.preventDefault();

        this.move_start = 0;


    }

    touchMove(ev){

        ev.preventDefault();

        this.onDrag(ev.changedTouches[0]);

    }

}