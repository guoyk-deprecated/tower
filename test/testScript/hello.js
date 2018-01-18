(async function($context, $input, $output) {
  const tools = await $context.$load('tools')
  console.log(tools)
  let v = await Promise.resolve(1)
  $output.value = $input.value + v
  $output.hello = tools.hello
})
