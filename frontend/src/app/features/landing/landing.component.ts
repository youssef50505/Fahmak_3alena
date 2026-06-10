import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styles: []
})
export class LandingComponent {
  features = [
    {
      title: 'Adaptive Learning',
      description: 'AI-driven paths tailored perfectly to your unique pace and learning style.',
      icon: '🧠'
    },
    {
      title: 'Virtual Classrooms',
      description: 'Immersive and interactive environments bridging the gap between remote and reality.',
      icon: '🌐'
    },
    {
      title: 'Gamified Experience',
      description: 'Earn points, unlock badges, and compete on leaderboards as you master new skills.',
      icon: '🏆'
    }
  ];
}
