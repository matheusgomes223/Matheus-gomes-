import { Injectable, signal } from '@angular/core';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  
  private audioContext: AudioContext | null = null;

  constructor() {
    // Add a welcome notification
    this.add('Bem-vindo', 'Sistema iniciado com sucesso.', 'SUCCESS');
  }

  add(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO') {
    const newNotification: AppNotification = {
      id: crypto.randomUUID(),
      title,
      message,
      time: new Date(),
      read: false,
      type
    };

    this.notifications.update(current => [newNotification, ...current]);
    this.updateUnreadCount();
    this.playSound(type);
  }

  markAsRead(id: string) {
    this.notifications.update(current => 
      current.map(n => n.id === id ? { ...n, read: true } : n)
    );
    this.updateUnreadCount();
  }

  markAllAsRead() {
    this.notifications.update(current => 
      current.map(n => ({ ...n, read: true }))
    );
    this.updateUnreadCount();
  }

  clearAll() {
    this.notifications.set([]);
    this.updateUnreadCount();
  }

  private updateUnreadCount() {
    this.unreadCount.set(this.notifications().filter(n => !n.read).length);
  }

  private playSound(type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO') {
    try {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume();
      }

      const masterGain = this.audioContext.createGain();
      masterGain.connect(this.audioContext.destination);
      masterGain.gain.value = 0.6; // Volume mestre

      const now = this.audioContext.currentTime;

      // Função para tocar uma nota estilo sino/marimba bem cristalina e macia
      const playNote = (freq: number, startTime: number, duration: number, vol: number) => {
        if (!this.audioContext) return;
        
        // Corpo principal do som (onda senoidal suave)
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        // Brilho/transiente inicial (onda triangular levemente desafinada para dar efeito de sino)
        const oscBright = this.audioContext.createOscillator();
        oscBright.type = 'triangle';
        oscBright.frequency.setValueAtTime(freq * 2.01, startTime);

        const gainNode = this.audioContext.createGain();
        const brightGainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        oscBright.connect(brightGainNode);
        
        gainNode.connect(masterGain);
        brightGainNode.connect(masterGain);

        // Envelope do corpo principal (ataque muito rápido e decay longo e suave)
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(vol, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        // Envelope do brilho (decai super rápido, apenas para o "click/sino" inicial)
        brightGainNode.gain.setValueAtTime(0, startTime);
        brightGainNode.gain.linearRampToValueAtTime(vol * 0.3, startTime + 0.01);
        brightGainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);

        osc.start(startTime);
        oscBright.start(startTime);

        osc.stop(startTime + duration + 0.1);
        oscBright.stop(startTime + 0.4);
      };

      // Diferentes melodias satisfatórias dependendo do tipo da notificação
      if (type === 'SUCCESS') {
        // Melodia Mágica Ascendente (G5 -> C6)
        playNote(783.99, now, 1.5, 0.4);       // G5
        playNote(1046.50, now + 0.09, 2.0, 0.4); // C6
      } else if (type === 'ERROR') {
        // Som suave, abafado e curto (F4 -> Eb4)
        playNote(349.23, now, 0.5, 0.4);
        playNote(311.13, now + 0.15, 0.7, 0.4);
      } else if (type === 'WARNING') {
        // Duplo toque suave (C5 -> C5)
        playNote(523.25, now, 0.6, 0.3);
        playNote(523.25, now + 0.18, 0.9, 0.4);
      } else {
        // INFO / DEFAULT: Gotícula elegante (A5 -> C#6)
        playNote(880.00, now, 1.2, 0.3);
        playNote(1108.73, now + 0.1, 1.5, 0.3);
      }

    } catch (e) {
      console.error('Error playing notification sound', e);
    }
  }
}
