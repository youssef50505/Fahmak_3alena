import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent, RouterTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 3 features defined', () => {
    expect(component.features.length).toBe(3);
  });

  it('should have Adaptive Learning feature', () => {
    const adaptiveFeature = component.features.find(f => f.title === 'Adaptive Learning');
    expect(adaptiveFeature).toBeTruthy();
    expect(adaptiveFeature?.icon).toBe('🧠');
  });

  it('should render the features in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const featureTitles = Array.from(compiled.querySelectorAll('h3')).map(el => el.textContent?.trim());
    
    expect(featureTitles).toContain('Adaptive Learning');
    expect(featureTitles).toContain('Virtual Classrooms');
    expect(featureTitles).toContain('Gamified Experience');
  });
});
