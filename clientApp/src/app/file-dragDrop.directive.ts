import { Directive, HostListener, HostBinding, Output, EventEmitter, Input, Renderer2, ElementRef } from '@angular/core';

@Directive({
  selector: '[fileDragDrop]'
})

export class FileDragNDropDirective {  
  @Output() private filesChangeEmiter : EventEmitter<File[]> = new EventEmitter();  


  constructor(private el:ElementRef, private renderer: Renderer2) { }

  @HostListener('dragover', ['$event']) public onDragOver(evt:any){
    this.preventDefaultProgation(evt);

    this.renderer.setStyle(this.el.nativeElement,'background-color','lightgray');
    this.renderer.setStyle(this.el.nativeElement,'border-color','cadetblue');
    this.renderer.setStyle(this.el.nativeElement,'border','3px solid');
    
  }

  @HostListener('dragleave', ['$event']) public onDragLeave(evt:any){
    this.preventDefaultProgation(evt);
    this.renderer.setStyle(this.el.nativeElement,'background-color','#eee');
    this.renderer.setStyle(this.el.nativeElement,'border-color','black');
    this.renderer.setStyle(this.el.nativeElement,'border','4px dashed');    
  }

  @HostListener('drop', ['$event']) public onDrop(evt:any){
    this.preventDefaultProgation(evt);
    this.renderer.setStyle(this.el.nativeElement,'background-color','#eee');
    this.renderer.setStyle(this.el.nativeElement,'border-color','black');
    this.renderer.setStyle(this.el.nativeElement,'border','4px dashed');    
    let files = evt.dataTransfer.files;
    let valid_files : Array<File> = files;
    this.filesChangeEmiter.emit(valid_files);
  }

  public preventDefaultProgation(event:any){
    event.preventDefault();
    event.stopPropagation();
  }
}