import React, { useState, useEffect } from 'react';
import axios from 'axios';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useNavigate } from 'react-router-dom';
import './AssignedProjectsPage.css';

const AssignedProjectsPage = () => {
  const [assignedProject, setAssignedProject] = useState(null);
  const [error, setError] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No hay token de autenticación.');
      return;
    }

    const decoded = JSON.parse(atob(token.split('.')[1]));
    const userId = decoded.id;

    axios.get(`http://localhost:4000/api/projects/assigned-project/${userId}`)
      .then(response => {
        if (response.data.proyecto) {
          setAssignedProject(response.data.proyecto);
        } else {
          setError('No tienes proyectos asignados.');
        }
      })
      .catch(error => {
        console.error('Error al obtener el proyecto:', error);
        setError('No se pudieron obtener los proyectos asignados.');
      });
  }, []);

  const handleOpenEditor = () => {
    if (assignedProject) {
      navigate(`/edit-ui/${assignedProject.id}`);
    }
  };

  const handleDownloadZip = async () => {
    try {
      setIsGenerating(true);
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No hay token para autenticación.');
        setIsGenerating(false);
        return;
      }

      const response = await axios.get(`http://localhost:4000/api/projects/edit-ui/${assignedProject.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const proyecto = response.data.proyecto;
      const fabricJson = JSON.parse(JSON.parse(proyecto.fabricJson));
      const componentName = `${proyecto.nombre.replace(/\s+/g, '')}UiComponent`;
      const selectorName = proyecto.nombre.toLowerCase().replace(/\s+/g, '-');

      // Archivo principal del componente - Versión corregida
      const tsContent = `import { Component, afterNextRender, NgZone } from '@angular/core';
import { NgIf } from '@angular/common';
import * as fabric from 'fabric';

@Component({
  selector: 'app-${selectorName}',
  standalone: true,
  imports: [NgIf],
  template: \`
    <div class="canvas-loading" *ngIf="!canvasLoaded">
      <div class="loading-spinner"></div>
    </div>
    <canvas id="canvas" [class.hidden]="!canvasLoaded"></canvas>
  \`,
  styles: [\`
    :host {
      display: block;
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
    canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
    .canvas-loading {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background-color: white;
    }
    .loading-spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      border-top: 4px solid #3498db;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .hidden {
      visibility: hidden;
    }
  \`]
})
export class ${componentName} {
  private canvas!: fabric.Canvas;
  canvasLoaded = false;

  constructor(private ngZone: NgZone) {
    afterNextRender(() => {
      this.initializeCanvas();
    });
  }

  private initializeCanvas(): void {
    this.ngZone.run(() => {
      this.canvas = new fabric.Canvas('canvas', {
        width: window.innerWidth,
        height: window.innerHeight,
        selection: false,
        interactive: false,
        renderOnAddRemove: true,
        backgroundColor: '#ffffff'
      });

      fabric.Object.prototype.selectable = false;
      fabric.Object.prototype.evented = false;
      
      const resizeHandler = () => {
        this.canvas.setDimensions({
          width: window.innerWidth,
          height: window.innerHeight
        });
        this.canvas.renderAll();
      };
      
      window.addEventListener('resize', resizeHandler);

      setTimeout(() => {
        this.canvas.loadFromJSON(${JSON.stringify(fabricJson)}, () => {
          this.canvas.calcOffset();
          this.canvas.renderAll();
          this.canvasLoaded = true;
          setTimeout(() => this.canvas.renderAll(), 50);
        });
      }, 100);
    });
  }
}`;

      // Archivos de configuración
      const routesContent = `import { Routes } from '@angular/router';
import { ${componentName} } from './${componentName}';

export const routes: Routes = [
  { path: '${selectorName}', component: ${componentName} }
];`;

      const appConfigContent = `import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)]
};`;

      const mainContent = `import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import 'fabric';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));`;

      const appComponentContent = `import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: '<router-outlet></router-outlet>'
})
export class AppComponent {}`;

      // Creación del ZIP
      const zip = new JSZip();
      const componentFolder = zip.folder(componentName);
      
      componentFolder.file(`${componentName}.ts`, tsContent);
      zip.file('app.routes.ts', routesContent);
      zip.file('app.config.ts', appConfigContent);
      zip.file('main.ts', mainContent);
      zip.file('app.component.ts', appComponentContent);
      
      zip.file('README.txt', `INSTRUCCIONES:
1. npm install
2. npm install fabric @types/fabric
3. ng serve
4. Accede a http://localhost:4200/${selectorName}`);

      // Generar y descargar el ZIP
      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${componentName}_angular_project.zip`);
      setIsGenerating(false);

    } catch (error) {
      console.error('Error al generar el zip:', error);
      setError('No se pudo descargar el proyecto.');
      setIsGenerating(false);
    }
  };

  return (
    
    <div className="assigned-container">
     
      <h2 className="assigned-title">Mi Proyecto Asignado</h2>

      {error && <p className="assigned-error">{error}</p>}

      {assignedProject && (
        <div className="project-card">
          <h3 className="project-title">{assignedProject.nombre}</h3>
          <p className="project-description">{assignedProject.descripcion}</p>

          <div className="button-group">
            <button 
              className="editor-button"
              onClick={handleOpenEditor}
              disabled={isGenerating}
            >
              Abrir Editor
            </button>
            <button 
              className="download-button"
              onClick={handleDownloadZip}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Descargar Vista'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignedProjectsPage;