// 使用说明 
// 1. 执行 npm i node-pinyin 安装汉字转换中文包
// 2.然后把这个文件拖到和要被转换的模块同等级（在一个文件夹下）
// 3.把下面name变量的名字替换成你要翻译的模块的名字
// 4.执行 node find-chinese.js 
// 5.替换完成 文件会自动替换 每一页语言包的键值 会打印在控制台 需要手动赋值然后合成一个文件
// 6.中文语言的键值对如何转换成 其他语言 可以见本人另一个转换语言工具 QAQ

// 谨慎起见 最好一个小模块一个小模块替换 替换完就运行一下看看是否正确

// 缺点！！（技术所限）
// 1.无法判断是否为注释 所以会把中文的注释也替换成语言包形式


const fs = require("fs");
const pinyin = require("node-pinyin");

// 模块名字 这个一定要替换啊啊啊啊啊啊！！！！！！！
let name = "vuuue"

// 最终的结果
var index = {};

fun(name)

function fun(name) {

    // 判断是目录还是文件
    fs.stat(name, function (err, stats) {
        if (err) {
            return console.error(err);
        }
        // 是目录 去查他下面的所有文件 
        if (stats.isDirectory()) {
            console.log('是目录')
            // 读取目录
            fs.readdir(`${name}/`, function (err, files) {
                if (err) {
                    return console.error(err);
                }
                files.forEach(function (file) {
                    // mac系统会有这个文件 这个文件就跳过
                    if (file == '.DS_Store') {
                        return
                    }
                    console.log(file);
                    // 为下面的每一个文件 重新判断
                    fun(`${name}/${file}`)
                });
            });
        }

        // 是文件
        if (stats.isFile()) {
            // 读文件
            fs.readFile(name, (err, data) => {
                if (err) {
                    console.log(err);
                } else {
                    //   获取成功 转为字符串
                    let transferStr = data.toString();

                    // 拆分成 template 和 script 两部分
                    let spl = transferStr.split('</template>')
                    let temp = spl[0],
                        scri = spl[1];

                    // 替换template里面 input标签 palceholder的文字
                    temp = temp.replace(/(placeholder=")([\u4e00-\u9fa5]+)"/g, (str) => {
                        // 匹配到的字符串里面的中文 换成 语言包格式
                        str = str.replace(/([\u4e00-\u9fa5]+)/g, (chinese) => {
                            // 转成拼音
                            let pin = pinyin(chinese, {
                                style: "normal"
                            }).join("")
                            // 并添加到index对象里面
                            index[pin] = chinese;
                            // 返回语言包格式
                            return `$t('index.${pin}')`
                        })
                        // 加冒号
                        return `:${str}`
                    })

                    // 替换template里面的文字 `{{$t('index.$1')}}` 所以如果有palceholder需要注意一下
                    temp = temp.replace(/([\u4e00-\u9fa5]+)/g, (chinese) => {
                        // 转成拼音
                        let pin = pinyin(chinese, {
                            style: "normal"
                        }).join("")
                        // 并添加到index对象里面
                        index[pin] = chinese;
                        // 返回语言包格式
                        return `{{$t('index.${pin}')}}`
                    })

                    // 替换template里面的文字 `$t('index.$1')` 所以如果有palceholder需要注意一下
                    scri = scri.replace(/(['"])([\u4e00-\u9fa5]+)\1/g, (chinese) => {
                        // 去掉头尾引号
                        chinese = chinese.slice(1, -1)
                        // 转成拼音
                        let pin = pinyin(chinese, {
                            style: "normal"
                        }).join("")
                        // 并添加到index对象里面 `${pin}`
                        index[pin] = chinese;
                        // 返回语言包格式
                        return `this.$t('index.${pin}')`
                    })

                    // 上下部分拼到一起 写回文件里
                    fs.writeFile(name, temp + '</template>' + scri, function (err) {
                        if (err) {
                            return console.error(err);
                        }
                        console.log("数据写入成功！");
                    });
                    // 打印当前页面所有键值结果
                    console.log(index);
                }
            });
        }
    });
}