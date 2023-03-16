const searchID = (target,IDList=[]) => {
  let right = IDList.length-1;
  let left = 0;
  while(left<=right) {
    const middle = Math.floor((right+left)/2);
    const val = IDList[middle]
    if(val === target) {
      return true;
    }else if(val < target) {
      left = middle+1
    }else {
      right = middle-1
    }
  }
  return false
}
export default searchID