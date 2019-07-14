let height = 800;
let width = 800;
var background_color = 220;
var stroke_colors = 20;

var radius = 60;
var diameter = radius * 2;
var offset = -50;
var angle_offset = - 3.1415/2;
var center_x = width - 2 *radius - stroke_colors - 1.3*offset;
var center_y = 2 * radius + stroke_colors - 3 * offset;

var size_color = 7;
var size_draw = 5;
var max_size_draw = 15;
var size_selectors = 5;

var drawing_zone = [10, 10, width - 3*radius, height-100];

function cart_to_polar(x,y){
    if (x==0){
	if (y>0){
	    return PI/2;
	}
	else{
	    return 3*PI/2;
	}
    }
    if (x>0 && y>=0){
	return atan(y/x);
    }
    if (x>0 && y<0){
	return 2*PI + atan(y/x);
    }
    if (x<0 && y<=0){
	return PI + atan(y/x);
    }
    if (x<0 && y>0){
	return PI - atan(y/(-x));
    }
}

class Drawing {
    constructor(RGB) {
	this.color = RGB;
	this.drawing = [];
    }

    record_drawing(x,y){
	this.drawing.push(createVector(x, y));
    }

    display_drawing(){
	noFill();
	stroke(this.color);
	strokeWeight(size_draw);
	
	beginShape();
	for (let v of this.drawing) {
    	    vertex(v.x, v.y);
	}
	endShape();
    }
}

class Selector {
    constructor(theta_min){
	this.theta_min = theta_min;
	this.theta_max = theta_min + 2 * PI /3;
	this.theta = this.theta_min;
    }
    
    draw(k){
	let coord = this.polar_to_cart();
	
	let RGB = [0,0,0];
	RGB[k] = 255;

	noFill();
	
	ellipse(coord[0], coord[1], size_selectors, size_selectors);
    }

    polar_to_cart(){
	return [center_x + radius *  cos(this.theta), center_y + radius * sin(this.theta)]
    }

    get_value_color(){
	return (this.theta - this.theta_min) * 255;
    }
}

class Circle {
    constructor(){
	this.selectors = [];
	for (let i=0; i<3; i++){
	    this.selectors.push(new Selector(i*2*PI/3));
	}
 	this.rad_central = radius * size_draw / max_size_draw;
    }
    
    draw_contour(){
	for (let k=0; k < 3; k++){
	    let RGB = [255, 255, 255];
	    
	    //	    let incr =  get_diff_angles(this.selectors[k].theta_min, this.selectors[k].theta_max) / 255;
	    let incr = (this.selectors[k].theta_max - this.selectors[k].theta_min) / 255;
	    
	    for (let i=0; i<255; i++){
		RGB[k] = 255;
		RGB[(k + 1) % 3] = 255-i;
		RGB[(k + 2) % 3] = 255-i;
		strokeWeight(size_color);
		stroke(RGB);
		noFill();
		let t_min = this.selectors[k].theta_min + i * incr;
		arc(center_x, center_y, diameter, diameter, t_min, t_min + incr);
	    }
	}
    }

    draw_selectors(){
	for (let k =0; k<3; k++){
	    this.selectors[k].draw(k);
	}
    }

    draw_central_circle(){
	fill(this.get_RGB());
	stroke(0,0,0);
	strokeWeight(1);
	this.rad_central = radius * size_draw / max_size_draw;
	ellipse(center_x, center_y, this.rad_central , this.rad_central);
    }

    draw_all(){

	// Erase circle to redraw it
	fill(background_color);
	stroke(background_color);
	ellipse(center_x, center_y, (radius + size_selectors)*2, (radius + size_selectors)*2);

	circle.draw_contour();
	circle.draw_central_circle();
	circle.draw_selectors();
    }

    get_RGB(){
	let RGB =[];
	for (let k=0; k<3; k++){
	    RGB.push(this.selectors[k].get_value_color())
	}
	return RGB;
    }
}


function setup() {
    createCanvas(width, height);
    circle = new Circle();
    draw_background();
}

function draw_background(){
    background(background_color);
    
    fill(255,255,255);
    stroke(255,255,255);
    rect(drawing_zone[0], drawing_zone[1], drawing_zone[2], drawing_zone[3]);

    circle.draw_all();

    stroke(0,0,0);
    strokeWeight(1);
    text("click in the center", center_x - radius, center_y + 1.5*radius);
    text("to restart", center_x - radius / 2, center_y + 1.5 *radius + 20);

    
    let p = createVector(center_x - 1.2 * radius / 2, center_y - 1.7 * radius + 20);
    text("+", p.x, p.y);
    
    let m = createVector(center_x +  radius / 2, center_y - 1.7 * radius + 20);
    text("-", m.x, m.y);

    noFill();
    strokeWeight(2);
    stroke(0,0,0);
    center_p = createVector(p.x + 5, p.y - 4);
    center_m = createVector(m.x + 2, m.y - 4);
    radius_p_m = 15;
    ellipse(center_p.x, center_p.y, radius_p_m, radius_p_m);
    ellipse(center_m.x, center_m.y, radius_p_m, radius_p_m);

    fill(255,255,255);
    ellipse(center_x, center_p.y, 16,16);

}
    
function pressed_in_cercle(center, radius){
    return ((mouseX - center[0])**2 + (mouseY - center[1])**2 <= radius**2)
}

function pressed_in_ring(center, radius_min, radius_max){
    return pressed_in_cercle(center, radius_max) && !(pressed_in_cercle(center, radius_min))
}

function mousePressed(){
    if ( pressed_in_cercle([center_x, center_y], circle.rad_central / 2)){
	// If mouse is pressed in the center of circle
	draw_background();
    }

    if (pressed_in_cercle([center_x, center_p.y], 8)){
	for(let k = 0; k<3; k++){
	    circle.selectors[k].theta = circle.selectors[k].theta_max;
	    size_draw = max_size_draw;
	}
    }

    if (pressed_in_cercle([center_m.x, center_m.y], radius_p_m)){
	size_draw = max(1, size_draw - 1);
    }

    if (pressed_in_cercle([center_p.x, center_p.y], radius_p_m)){
	size_draw = min(max_size_draw, size_draw + 1);
    }
    
    else{
	drawing = new Drawing(circle.get_RGB());
    }
    circle.draw_all();
}


function display_all_drawings(RGB){
    for (let d of drawing_list){
    	display_current_drawing(d);
    }
}

function draw() {
    if (mouseIsPressed){
	if (mouseX > drawing_zone[0] && mouseY > drawing_zone[1] && mouseX < drawing_zone[2] && mouseY < drawing_zone[3]){
	    // If mouse is pressed in the drawing region 
	    drawing.record_drawing(mouseX, mouseY);
	    drawing.display_drawing();
	}


	if (pressed_in_ring([center_x, center_y], radius - size_color, radius + size_color)){
	    let theta = cart_to_polar(mouseX - center_x, mouseY - center_y);
	    for (let k=0; k<3; k++){
		selec = circle.selectors[k]
		if (theta < selec.theta_max && theta > selec.theta_min){
		    selec.theta = theta;
		}
	    }
	    
	    circle.draw_all();
	}

    }
    
}
