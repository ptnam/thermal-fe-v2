import {UserConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import {createSvgIconsPlugin} from 'vite-plugin-svg-icons'
import {resolve} from 'path'
import {viteStaticCopy} from 'vite-plugin-static-copy'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'
import tailwindcss from '@tailwindcss/vite'
import {ComponentResolver} from 'unplugin-vue-components'
import path from 'path'
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
const root = process.cwd()

function pathResolve(dir: string) {
    return resolve(root, '.', dir)
}

const TreeSelectResolver: ComponentResolver = {
    type: 'component',
    resolve: (name: string) => {
        if (name === 'ElTreeSelect') {
            return {
                name,
                from: 'element-plus/es/components/tree-select',
            }
        }
    }
}
export default (): UserConfig => {
    return {
        plugins: [
            vue(),
            vueJsx(),
            tailwindcss(),
            // visualizer({ open: true }),
            AutoImport({
                resolvers: [ElementPlusResolver()],
            }),
            Components({
                resolvers: [ElementPlusResolver(), TreeSelectResolver],
            }),
            VueI18nPlugin({
                runtimeOnly: true,
                compositionOnly: true,
                include: [resolve(__dirname, 'src/locales/**')]
            }),
            createSvgIconsPlugin({
                iconDirs: [pathResolve('src/assets/svgs')],
                symbolId: 'icon-[dir]-[name]',
                svgoOptions: true
            }),
            viteStaticCopy({
                targets: [
                    {
                        src: '.htaccess',
                        dest: '.' // Copies to dist/
                    }
                ]
            })
        ],
        css: {
            preprocessorOptions: {
                scss: {api: 'modern-compiler'},
            }
        },
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
            },
        },
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (id.includes('node_modules')) {
                            // Vue ecosystem
                            if (
                                id.includes('vue') ||
                                id.includes('pinia') ||
                                id.includes('vue-router') ||
                                id.includes('vue-i18n')
                            ) {
                                return 'chunk-vue'
                            }

                            // Element Plus
                            if (
                                id.includes('element-plus') ||
                                id.includes('@element-plus')
                            ) {
                                return 'chunk-element-plus'
                            }

                            // Leaflet
                            if (
                                id.includes('leaflet') ||
                                id.includes('@vue-leaflet')
                            ) {
                                return 'chunk-leaflet'
                            }

                            // Apexcharts
                            if (id.includes('apexcharts')) {
                                return 'chunk-apexcharts'
                            }

                            // SignalR
                            if (id.includes('@microsoft/signalr')) {
                                return 'chunk-signalr'
                            }

                            // Lodash (lodash-unified or lodash-es)
                            if (
                                id.includes('lodash-es') ||
                                id.includes('lodash-unified')
                            ) {
                                return 'chunk-lodash'
                            }

                            // LibreDWG
                            if (id.includes('@mlightcad/libredwg-web')) {
                                return 'chunk-libredwg'
                            }

                            // Firebase
                            if (id.includes('firebase') || id.includes('@firebase')) {
                                return 'chunk-firebase'
                            }

                            // Intlify
                            if (id.includes('@intlify')) {
                                return 'chunk-intlify'
                            }

                            // NProgress
                            if (id.includes('nprogress')) {
                                return 'chunk-nprogress'
                            }

                            // Day.js
                            if (id.includes('dayjs')) {
                                return 'chunk-dayjs'
                            }

                            // Default for other vendor libraries
                            return 'chunk-vendor'
                        }
                        // Optional: Shared components logic
                        if (id.includes(path.resolve(__dirname, 'src/components'))) {
                            return 'chunk-commons'
                        }
                    },
                    entryFileNames: 'assets/[name].[hash].js',
                    chunkFileNames: 'assets/[name].[hash].js',
                    assetFileNames: 'assets/[name].[hash].[ext]',
                }
            }
        },
        optimizeDeps: {
            include: [
                'vue',
                'vue-router',
                'vue-types',
                'element-plus/es/locale/lang/vi',
                'element-plus/es/locale/lang/en',
                'axios',
            ]
        }
    }
}
