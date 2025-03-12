import { Component} from '@angular/core';

import { addIcons } from 'ionicons';
import { library, playCircle, radio, search } from 'ionicons/icons';
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],

  standalone: false,

})
export class AdminPage  {
  constructor() {
    // If you need to add icons, do it here
    addIcons({
      library,
      playCircle,
      radio,
      search
    });
  }
  
}
