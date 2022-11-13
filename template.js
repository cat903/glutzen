var a = `#ifdef __APPLE_CC__
#define GL_SILENCE_DEPRECATION
#include <GLUT/glut.h>
#else
#include <GL/glut.h>
#endif
#include <stdlib.h>
#include <math.h>
#define tPi 6.2832

`;

var b = `void dispFilledelipse(GLfloat x, GLfloat y, GLfloat xcenter, GLfloat ycenter){

    int trN = 100;
    glBegin(GL_TRIANGLE_FAN);
    glVertex2f(x, y);
    for (int i = 0; i <= trN; i++)
    {
        glVertex2f(
            x + ((xcenter)*cos(i * tPi / trN)),
            y + ((ycenter)*sin(i * tPi / trN)));
    }
    glEnd();
}
`;

var c = `void init(){
    glClearColor(1.0f, 1.0f, 1.0f, 1.0f);
    gluOrtho2D(0, 600, 600, 0);
}
void display(void){
    glClear(GL_COLOR_BUFFER_BIT);
    `;

var d = `
    glFlush();
}
int main(int argc, char **argv){
    glutInit(&argc, argv);
    glutInitWindowSize(600, 600);
    glutInitWindowPosition(300, 300);
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB);
    glutCreateWindow("GlutZen");
    init();
    glutDisplayFunc(display);
    glutMainLoop();
    return 0;
}`;
