/*   npm install sass gulp-sass --save-dev */
import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';

const sass = gulpSass(dartSass);


/* npm install imagemin  imagemin-webp --save-dev */
import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';

/* npm i imagemin-avif */
import imageminAvif from 'imagemin-avif';



function watch() {
    gulp.watch('./src/scss/**/*.scss', buildStyles);
    gulp.watch('js/**/*.js', javascript);
}

//Copile scss into css and put i into the build folder
function buildStyles(){
    return gulp.src('./src/scss/**/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./build/css'));
};

function javascript(){
    return gulp.src('js/**/*.js')
        .pipe(gulp.dest('build/js'));
}

async function optimizateImages(){
    await imagemin(['src/images/*.{jpg,png}'],{
        destination: 'build/images',
        plugins: [
            imageminWebp({quality: 80}),
            imageminAvif({quality: 80})
        ]
    })
}


//Lista de DefaultTask
const defaultTask = gulp.series(
        buildStyles,
        javascript,
        optimizateImages,
        watch
      
);

export {buildStyles, optimizateImages, watch, javascript};
export default defaultTask;