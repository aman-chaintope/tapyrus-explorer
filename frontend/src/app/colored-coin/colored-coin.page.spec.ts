import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ColoredCoinPage } from './colored-coin.page';

describe('ColoredCoinPage', () => {
  let component: ColoredCoinPage;
  let fixture: ComponentFixture<ColoredCoinPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColoredCoinPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ColoredCoinPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
