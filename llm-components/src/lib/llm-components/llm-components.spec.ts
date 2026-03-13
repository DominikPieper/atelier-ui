import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LlmComponents } from './llm-components';

describe('LlmComponents', () => {
  let component: LlmComponents;
  let fixture: ComponentFixture<LlmComponents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LlmComponents],
    }).compileComponents();

    fixture = TestBed.createComponent(LlmComponents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
