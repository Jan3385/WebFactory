let ExecTimeStarts: number[] = [];
function TimeExec(id: number){
    if(ExecTimeStarts[id] == undefined || Number.isNaN(ExecTimeStarts[id])) ExecTimeStarts[id] = performance.now();
    else{
        console.log(`Execution time of ${id}: ${performance.now() - ExecTimeStarts[id]}ms`);
        ExecTimeStarts[id] = Number.NaN;
    }
}
