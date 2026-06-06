import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LineItemEditorComponent } from './line-item-editor.component';

describe('LineItemEditorComponent', () => {
  let component: LineItemEditorComponent;
  let fixture: ComponentFixture<LineItemEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineItemEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(LineItemEditorComponent);
    component = fixture.componentInstance;
    component.today = '2026-06-06';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit addLineItem when add button clicked', () => {
    component.canAdd = true;
    fixture.detectChanges();

    vi.spyOn(component.addLineItem, 'emit');

    const button = fixture.nativeElement.querySelector('button[type="button"]');
    button.click();

    expect(component.addLineItem.emit).toHaveBeenCalled();
  });
});
