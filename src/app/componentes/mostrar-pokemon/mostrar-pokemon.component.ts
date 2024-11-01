import { ChangeDetectionStrategy, Component, OnDestroy, computed, effect, signal } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { PokemonServiceService } from '../../servicios/pokemon-service.service';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ImageModule } from 'primeng/image';



//private messageService: MessageService
@Component({
  selector: 'app-mostrar-pokemon',
  standalone: true,
  imports: [ 
    HttpClientModule, 
    FormsModule,
    InputTextModule,
    ButtonModule,
    ToastModule,
    CommonModule,
    InputIconModule, 
    IconFieldModule,
    FloatLabelModule,
    ToggleButtonModule,
    ImageModule
  ],
  templateUrl: './mostrar-pokemon.component.html',
  styleUrls: ['./mostrar-pokemon.component.scss'], // Corrige 'styleUrl' a 'styleUrls'
  providers: [PokemonServiceService, MessageService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MostrarPokemonComponent implements OnDestroy{
  pokemonNameOrId = signal('')
  loading = signal(false);
  pokemonData = signal<any>(null);
  animationArray = signal<string[]>([]);
  indiceActual = signal(0);
  animating = signal(false);
  visible: boolean = false;
  shiny : boolean = false;
  detallesExtra : boolean = false;

  imagenActual = computed(() => {
    const array = this.animationArray();
    return array.length > 0 ? array[this.indiceActual()] : '';
  });
  
  constructor( 
    private pokemonService: PokemonServiceService,
    private messageService: MessageService
    ){
      effect(() => {
        if (this.animating()) {
          this.animateFrames();
        }
      });
    }
  ngOnDestroy(): void {
    this.detenerAnimacion();
  }

  playSound(soundSource: string){
    const audio = new Audio();
    audio.src = soundSource;
    audio.load();
    audio.play();
    audio.volume = 0.3
  }

  loadPokemon(){
    if(this.pokemonNameOrId().length > 0){
      this.detenerAnimacion();
      this.loading.set(true);
      this.pokemonService.getPokemon(this.pokemonNameOrId()).subscribe({
        next: (pokemon: any) =>{  
          this.pokemonData.set(pokemon);
          this.loading.set(false);
          console.log(this.pokemonData());
          if(!this.shiny) {
          this.animationArray.set([
            pokemon.sprites.front_default,
            pokemon.sprites.back_default
          ]);
          }
          if(this.shiny) {
            this.animationArray.set([
              pokemon.sprites.front_shiny,
              pokemon.sprites.back_shiny
            ]);
            }
          this.iniciarAnimacion();
          this.playSound(this.pokemonData().cries.latest)
        },
        error: (err: any) =>{ 
          console.log(err)
          this.showErrorPokemon()
          this.loading.set(false)
        }
      })
    } else {
      this.showNoPokemon()
    }

}


  iniciarAnimacion() {
    this.indiceActual.set(0);
    this.animating.set(true);
  }

  animateFrames() {
    setTimeout(() => {
      if (this.animating()) {
        this.indiceActual.update(index => (index + 1) % this.animationArray().length);
        this.animateFrames();
      }
    }, 1000);
  }

  detenerAnimacion() {
    this.animating.set(false);
  }

  updateName(name: string) {
    this.pokemonNameOrId.set(name.toLocaleLowerCase());
  }
  
  capitalizeFirstLetter(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  showErrorPokemon() {
    if (!this.visible) {
      this.messageService.add({ key: 'confirm', sticky: true, severity: 'success', summary: 'Nombre o numero de pokemon no válido, por favor intente otro' });
        this.visible = true;
    }
}

showNoPokemon() {
  if (!this.visible) {
    this.messageService.add({ key: 'confirm', sticky: true, severity: 'success', summary: 'Escriba un nombre o numero de pokedex de un pokemon para cargar' });
      this.visible = true;
  }
}


onConfirm() {
    this.messageService.clear('confirm');
    this.visible = false;
}

onReject() {
    this.messageService.clear('confirm');
    this.visible = false;
  }
}