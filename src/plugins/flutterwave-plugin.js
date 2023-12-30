const FlutterwavePlugin = {
  install(Vue) {
    // Dynamically add the Flutterwave script to the body
    const script = document.createElement('script')
    script.src = 'https://checkout.flutterwave.com/v3.js'
    document.body.appendChild(script)

    // Attach Flutterwave to the Vue prototype
    // eslint-disable-next-line no-param-reassign
    Vue.prototype.$flutterwave = window.Flutterwave
  },
}

export default FlutterwavePlugin
