import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TransactionsModalPage } from './transactions-modal.page';

describe('TransactionsModalPage', () => {
  let component: TransactionsModalPage;
  let fixture: ComponentFixture<TransactionsModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransactionsModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TransactionsModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
