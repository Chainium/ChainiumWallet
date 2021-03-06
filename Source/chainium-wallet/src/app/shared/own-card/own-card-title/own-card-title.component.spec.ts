import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OwnCardTitleComponent } from './own-card-title.component';

describe('OwnCardTitleComponent', () => {
  let component: OwnCardTitleComponent;
  let fixture: ComponentFixture<OwnCardTitleComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ OwnCardTitleComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OwnCardTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
