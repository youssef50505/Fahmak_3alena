import { Component, CUSTOM_ELEMENTS_SCHEMA, AfterViewInit } from '@angular/core';

import { RouterModule } from '@angular/router';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';


gsap.registerPlugin(ScrollTrigger);

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class LandingComponent implements AfterViewInit {

  ngAfterViewInit() {
    // Hero Animations
    gsap.fromTo('.hero-content > *',
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: 'power3.out', delay: 0.2 }
    );

    gsap.fromTo('.hero-graphic',
      { opacity: 0, scale: 0.9, x: 50 },
      { opacity: 1, scale: 1, x: 0, duration: 1.5, ease: 'power3.out', delay: 0.5 }
    );

    // Scroll Animations for Bento Grid
    gsap.fromTo('.section-title',
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '#features',
          start: 'top 80%',
        }
      }
    );

    gsap.fromTo('.bento-card',
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: {
          trigger: '.bento-card',
          start: 'top 85%',
        }
      }
    );
  }
}
