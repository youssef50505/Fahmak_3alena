import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { VirtualClassroomComponent } from './virtual-classroom.component';
import { AiService } from '../../core/services/ai.service';

describe('VirtualClassroomComponent', () => {
  let component: VirtualClassroomComponent;
  let fixture: ComponentFixture<VirtualClassroomComponent>;
  let aiServiceSpy: jasmine.SpyObj<AiService>;

  beforeEach(async () => {
    aiServiceSpy = jasmine.createSpyObj('AiService', ['chat']);

    await TestBed.configureTestingModule({
      imports: [VirtualClassroomComponent, FormsModule],
      providers: [
        { provide: AiService, useValue: aiServiceSpy }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualClassroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with one AI message', () => {
    expect(component.chatMessages.length).toBe(1);
    expect(component.chatMessages[0].isAi).toBeTrue();
    expect(component.chatMessages[0].text).toContain('Hello! I am your AI Teaching Assistant');
  });

  it('should not send message if user input is empty or whitespace', () => {
    component.userInput = '   ';
    component.sendMessage();

    expect(aiServiceSpy.chat).not.toHaveBeenCalled();
    expect(component.chatMessages.length).toBe(1);
  });

  it('should add user message and call aiService on valid send', () => {
    component.userInput = 'Hello AI';
    aiServiceSpy.chat.and.returnValue(of({ reply: 'Hi User!' }));

    component.sendMessage();

    expect(component.chatMessages.length).toBe(3); // Initial + User + AI
    expect(component.chatMessages[1].text).toEqual('Hello AI');
    expect(component.chatMessages[1].isAi).toBeFalse();

    expect(component.chatMessages[2].text).toEqual('Hi User!');
    expect(component.chatMessages[2].isAi).toBeTrue();

    expect(component.userInput).toEqual('');
    expect(component.isAiTyping).toBeFalse();
    expect(aiServiceSpy.chat).toHaveBeenCalledWith('Hello AI', 'Course context: Machine Learning');
  });

  it('should show fallback message on API error', () => {
    component.userInput = 'Trigger error';
    aiServiceSpy.chat.and.returnValue(throwError(() => new Error('Server Error')));

    component.sendMessage();

    expect(component.chatMessages.length).toBe(3);
    expect(component.chatMessages[2].text).toContain('trouble connecting to my servers');
    expect(component.chatMessages[2].isAi).toBeTrue();
    expect(component.isAiTyping).toBeFalse();
  });
});
