
class KernelService{

  constructor(){
  }

  startModeMonitorSystem(){

    // this.onlineMonitor = setInterval(()=>{
    //
    // }, INTERVAL_TO_VERIFY_STATUS_SERVER)

  }

  setMode(status, model){
    if(status == 502){
      this.KERNEL_MODE_ONLINE = true;
      clearInterval(global.requestIn);
    }else{
      console.log("HERE")
      model.initListeningPackageIn();
      this.KERNEL_MODE_ONLINE = false;
    }
  }



}

export default KernelService;
