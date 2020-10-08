import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ColoredCoinsPage } from './colored-coins.page';

describe('ColoredCoinsPage', () => {
  let component: ColoredCoinsPage;
  let fixture: ComponentFixture<ColoredCoinsPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColoredCoinsPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ColoredCoinsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
