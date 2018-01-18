(async function($context, $input, $output) {
  const tools = await $context.$load('tools')
  let v = await Promise.resolve(1)
  $output.value = $input.value + v
  $output.hello = tools.hello
})
