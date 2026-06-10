import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImmersiveHubComponent } from './immersive-hub.component';

describe('ImmersiveHubComponent', () => {
  let component: ImmersiveHubComponent;
  let fixture: ComponentFixture<ImmersiveHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImmersiveHubComponent, HttpClientTestingModule, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ImmersiveHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
