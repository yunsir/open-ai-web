import { nextTick} from 'vue';
export const SCOPE = 'Vue3InfiniteScroll';

const InfiniteScroll = {
  mounted(el, binding, vnode) {
    const checkFull = () => {
      if (document.documentElement.clientHeight >= el.clientHeight) {

        el[SCOPE].expression.call();
      } else {
        if (el.observer) {
          el.observer.disconnect();
        }
      }
    };

    const doCheck = () => {
      const { container } = el[SCOPE];
      let containerScrollTop;
      if (container === window) {
        containerScrollTop = container.document.documentElement.scrollTop;
      } else {
        containerScrollTop = container.scrollTop;
      }
      let containerClientHeight;
      if (container === window) {
        containerClientHeight = container.document.documentElement.clientHeight;
      } else {
        containerClientHeight = container.clientHeight;
      }
      const elClientHeight = el.clientHeight;
      const shouldTrigger = containerScrollTop + containerClientHeight + 200 > elClientHeight;
      if (shouldTrigger) {
        el[SCOPE].expression.call();
      }
    };

    const throttle = (fn, delay) => {
      // 节流函数
      var now, lastExec, timer, context, args; // eslint-disable-line
      const execute = function () {
        fn.apply(context, args);
        lastExec = now;
      };
      return  () => {
        context = this;
        args = arguments; // eslint-disable-line

        now = Date.now();

        if (timer) {
          clearTimeout(timer);
          timer = null;
        }

        if (lastExec) {
          const diff = delay - (now - lastExec);
          if (diff < 0) {
            execute();
          } else {
            timer = setTimeout(() => {
              execute();
            }, diff);
          }
        } else {
          execute();
        }
      };
    };

    const getScrollEventTarget = (element) => {
      // 获取添加监听的Dom,获取到overflowY设置为‘scroll’或者‘auto’的节点，或者返回window对象
      let currentNode = element;
      while (
        /* eslint-disable */
        currentNode
        && currentNode.tagName !== 'HTML'
        && currentNode.tagName !== 'BODY'
        && currentNode.nodeType === 1
        /* eslint-disable */
      ) {
        const { overflowY } = getComputedStyle(currentNode);
        if (overflowY === 'scroll' || overflowY === 'auto') {
          return currentNode;
        }
        currentNode = currentNode.parentNode;
      }
      return window;
    };

    const throttleDelayExpr = el.getAttribute('infinite-scroll-throttle-delay')
      ? el.getAttribute('infinite-scroll-throttle-delay')
      : 1000;
    // eslint-disable-next-line no-param-reassign
    el[SCOPE] = {
      el,
      vm: vnode.context,
      expression: binding.value,
      config: {
        eventName: el.getAttribute('infinite-scroll-listen-for-event'),
        immediateCheckExpr: toBool(el.getAttribute('infinite-scroll-immediate-check'))
          ? toBool(el.getAttribute('infinite-scroll-immediate-check'))
          : false,
        distanceExpr: el.getAttribute('infinite-scroll-distance') ? el.getAttribute('infinite-scroll-distance') : 200,
        throttleDelayExpr,
      },
      container: getScrollEventTarget(el),
      onScroller: throttle(doCheck, throttleDelayExpr),
    };

    const bind = async () => {
      await nextTick();
      const { config, onScroller } = el[SCOPE];
      if (config.immediateCheckExpr) {
        const observer = new MutationObserver(checkFull);
        // eslint-disable-next-line no-param-reassign
        el.observer = observer; // 设置成全局
        observer.observe(el, { attributes: true, childList: true, subtree: true });
      }
      el[SCOPE].container.addEventListener('scroll', onScroller);
      //el[SCOPE].expression.call();
    };
    bind();
  },
  unmounted(el) {
    const { container, onScroller } = el[SCOPE];
    container?.removeEventListener('scroll', onScroller);
  },
};
function toBool(str:string){
  return str.toLowerCase() === 'true'
}

export default InfiniteScroll;