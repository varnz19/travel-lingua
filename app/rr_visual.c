#include <stdio.h>
#include <windows.h>

void setColor(int color) {
    SetConsoleTextAttribute(GetStdHandle(STD_OUTPUT_HANDLE), color);
}

void delay() {
    Sleep(800); // animation delay (increase if you want slower)
}

int main() {
    int n, tq;

    printf("Enter number of processes: ");
    scanf("%d", &n);

    int bt[n], rt[n];

    for(int i = 0; i < n; i++) {
        printf("Enter Burst Time for P%d: ", i+1);
        scanf("%d", &bt[i]);
        rt[i] = bt[i];
    }

    printf("Enter Time Quantum: ");
    scanf("%d", &tq);

    int time = 0, remaining = n, step = 1;
    int order[100], times[100];
    int k = 0;

    printf("\n===== ROUND ROBIN GANTT CHART =====\n");

    while(remaining > 0) {
        for(int i = 0; i < n; i++) {

            if(rt[i] > 0) {
                int exec;

                if(rt[i] > tq) {
                    exec = tq;
                    rt[i] -= tq;
                } else {
                    exec = rt[i];
                    rt[i] = 0;
                    remaining--;
                }

                order[k] = i+1;
                time += exec;
                times[k] = time;
                k++;

                // 🔥 STEP OUTPUT
                printf("\nStep %d:\n", step++);

                // TOP BORDER
                for(int j = 0; j < k; j++) {
                    printf("+--------");
                }
                printf("+\n");

                // PROCESS BOXES
                for(int j = 0; j < k; j++) {
                    setColor(10 + (order[j] % 6));
                    printf("|  P%-3d ", order[j]);
                    setColor(7);
                }
                printf("|\n");

                // BOTTOM BORDER
                for(int j = 0; j < k; j++) {
                    printf("+--------");
                }
                printf("+\n");

                // TIME LINE
                printf("0");
                for(int j = 0; j < k; j++) {
                    printf("       %d", times[j]);
                }
                printf("\n");

                delay(); // animation
            }
        }
    }

    printf("\n✅ All Processes Completed!\n");

    return 0;
}