import React, { useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './ChristmasPage.css';

// Config - đặt ngoài component để tránh re-create
const CONFIG = {
    goldCount: 2000,
    redCount: 300,
    giftCount: 150,
    explodeRadius: 65,
    photoOrbitRadius: 25,
    treeHeight: 70,
    treeBaseRadius: 35
};

const ChristmasPage = () => {
    const containerRef = useRef(null);
    const videoRef = useRef(null);
    const previewCanvasRef = useRef(null);
    const statusRef = useRef(null);
    const btnStartRef = useRef(null);

    // Refs for Three.js objects
    const sceneRef = useRef(null);
    const cameraRef = useRef(null);
    const rendererRef = useRef(null);
    const groupGoldRef = useRef(null);
    const groupRedRef = useRef(null);
    const groupGiftRef = useRef(null);
    const photoMeshesRef = useRef([]);
    const titleMeshRef = useRef(null);
    const starMeshRef = useRef(null);
    const loveMeshRef = useRef(null);
    const texturesRef = useRef({});
    const photoTexturesRef = useRef([]);
    const bgMusicRef = useRef(null);

    // State refs
    const stateRef = useRef('TREE');
    const selectedIndexRef = useRef(0);
    const handXRef = useRef(0.5);
    const animationIdRef = useRef(null);

    // Create custom texture
    const createCustomTexture = useCallback((type, THREE) => {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        const cx = 64, cy = 64;

        if (type === 'gold_glow') {
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40);
            grd.addColorStop(0, '#FFFFFF');
            grd.addColorStop(0.2, '#FFFFE0');
            grd.addColorStop(0.5, '#FFD700');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 128, 128);
        } else if (type === 'red_light') {
            const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, 50);
            grd.addColorStop(0, '#FFAAAA');
            grd.addColorStop(0.3, '#FF0000');
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = grd;
            ctx.fillRect(0, 0, 128, 128);
        } else if (type === 'gift_red') {
            ctx.fillStyle = '#D32F2F';
            ctx.fillRect(20, 20, 88, 88);
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(54, 20, 20, 88);
            ctx.fillRect(20, 54, 88, 20);
            ctx.strokeStyle = "rgba(0,0,0,0.3)";
            ctx.lineWidth = 2;
            ctx.strokeRect(20, 20, 88, 88);
        }
        return new THREE.CanvasTexture(canvas);
    }, []);

    // Create particle system
    const createParticleSystem = useCallback((type, count, size, THREE, scene, textures) => {
        const pPositions = [];
        const pExplodeTargets = [];
        const pTreeTargets = [];
        const pHeartTargets = [];
        const sizes = [];
        const phases = [];

        for (let i = 0; i < count; i++) {
            const h = Math.random() * CONFIG.treeHeight;
            const y = h - CONFIG.treeHeight / 2;
            let radiusRatio = (type === 'gold') ? Math.sqrt(Math.random()) : 0.9 + Math.random() * 0.1;
            const maxR = (1 - (h / CONFIG.treeHeight)) * CONFIG.treeBaseRadius;
            const r = maxR * radiusRatio;
            const theta = Math.random() * Math.PI * 2;
            const tx = r * Math.cos(theta);
            const tz = r * Math.sin(theta);
            pTreeTargets.push(tx, y, tz);

            const u = Math.random();
            const v = Math.random();
            const phi = Math.acos(2 * v - 1);
            const lam = 2 * Math.PI * u;
            let radMult = (type === 'gift') ? 1.2 : 1.0;
            const rad = CONFIG.explodeRadius * Math.cbrt(Math.random()) * radMult;
            const ex = rad * Math.sin(phi) * Math.cos(lam);
            const ey = rad * Math.sin(phi) * Math.sin(lam);
            const ez = rad * Math.cos(phi);
            pExplodeTargets.push(ex, ey, ez);

            const tHeart = Math.random() * Math.PI * 2;
            let hx = 16 * Math.pow(Math.sin(tHeart), 3);
            let hy = 13 * Math.cos(tHeart) - 5 * Math.cos(2 * tHeart) - 2 * Math.cos(3 * tHeart) - Math.cos(4 * tHeart);
            const rFill = Math.pow(Math.random(), 0.3);
            hx *= rFill;
            hy *= rFill;
            let hz = (Math.random() - 0.5) * 8 * rFill;
            const noise = 1.0;
            hx += (Math.random() - 0.5) * noise;
            hy += (Math.random() - 0.5) * noise;
            hz += (Math.random() - 0.5) * noise;
            const scaleH = 2.2;
            pHeartTargets.push(hx * scaleH, hy * scaleH + 5, hz);

            pPositions.push(tx, y, tz);
            sizes.push(size);
            phases.push(Math.random() * Math.PI * 2);
        }

        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(pPositions, 3));
        geo.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

        const colors = new Float32Array(count * 3);
        const baseColor = new THREE.Color();
        if (type === 'gold') baseColor.setHex(0xFFD700);
        else if (type === 'red') baseColor.setHex(0xFF0000);
        else baseColor.setHex(0xFFFFFF);

        for (let i = 0; i < count; i++) {
            colors[i * 3] = baseColor.r;
            colors[i * 3 + 1] = baseColor.g;
            colors[i * 3 + 2] = baseColor.b;
        }
        geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));

        geo.userData = {
            tree: pTreeTargets,
            explode: pExplodeTargets,
            heart: pHeartTargets,
            phases: phases,
            baseColor: baseColor,
            baseSize: size
        };

        const mat = new THREE.PointsMaterial({
            size: size,
            map: textures[type],
            transparent: true,
            opacity: 1.0,
            vertexColors: true,
            blending: (type === 'gift') ? THREE.NormalBlending : THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geo, mat);
        scene.add(points);
        return points;
    }, []);

    // Update particle group
    const updateParticleGroup = useCallback((group, type, targetState, speed, handRotY, time) => {
        if (!group || !group.geometry) return;

        const positions = group.geometry.attributes.position.array;
        const sizes = group.geometry.attributes.size.array;
        const colors = group.geometry.attributes.color.array;
        const phases = group.geometry.userData.phases;
        const baseColor = group.geometry.userData.baseColor;
        const baseSize = group.geometry.userData.baseSize;

        const targetKey = (targetState === 'TREE') ? 'tree' : (targetState === 'HEART' ? 'heart' : 'explode');
        const targets = group.geometry.userData[(targetState === 'PHOTO') ? 'explode' : targetKey];

        for (let i = 0; i < positions.length; i++) {
            positions[i] += (targets[i] - positions[i]) * speed;
        }
        group.geometry.attributes.position.needsUpdate = true;

        const count = positions.length / 3;

        if (targetState === 'TREE') {
            group.rotation.y += 0.003;
            for (let i = 0; i < count; i++) {
                sizes[i] = baseSize;
                let brightness = 1.0;
                if (type === 'red') {
                    brightness = 0.5 + 0.5 * Math.sin(time * 3 + phases[i]);
                } else if (type === 'gold') {
                    brightness = 0.8 + 0.4 * Math.sin(time * 10 + phases[i]);
                }
                colors[i * 3] = baseColor.r * brightness;
                colors[i * 3 + 1] = baseColor.g * brightness;
                colors[i * 3 + 2] = baseColor.b * brightness;
            }
            group.geometry.attributes.color.needsUpdate = true;
            group.geometry.attributes.size.needsUpdate = true;
        } else if (targetState === 'HEART') {
            group.rotation.y = 0;
            const beatScale = 1 + Math.abs(Math.sin(time * 3)) * 0.15;
            group.scale.set(beatScale, beatScale, beatScale);
            for (let i = 0; i < count; i++) {
                colors[i * 3] = baseColor.r;
                colors[i * 3 + 1] = baseColor.g;
                colors[i * 3 + 2] = baseColor.b;
                if (i % 3 === 0) sizes[i] = baseSize;
                else sizes[i] = 0;
            }
            group.geometry.attributes.color.needsUpdate = true;
            group.geometry.attributes.size.needsUpdate = true;
        } else {
            group.scale.set(1, 1, 1);
            group.rotation.y += (handRotY - group.rotation.y) * 0.1;
            for (let i = 0; i < count; i++) {
                sizes[i] = baseSize;
                let brightness = 1.0;
                if (type === 'gold' || type === 'red') {
                    brightness = 0.8 + 0.5 * Math.sin(time * 12 + phases[i]);
                }
                colors[i * 3] = baseColor.r * brightness;
                colors[i * 3 + 1] = baseColor.g * brightness;
                colors[i * 3 + 2] = baseColor.b * brightness;
            }
            group.geometry.attributes.size.needsUpdate = true;
            group.geometry.attributes.color.needsUpdate = true;
        }
    }, []);

    // Start system
    const startSystem = useCallback(async () => {
        if (btnStartRef.current) {
            btnStartRef.current.style.display = 'none';
        }

        // Load Three.js dynamically
        const THREE = await import('three');

        // Initialize audio
        const audioPath = process.env.PUBLIC_URL + '/christmas/audio.mp3';
        bgMusicRef.current = new Audio(audioPath);
        bgMusicRef.current.loop = true;
        bgMusicRef.current.volume = 1.0;
        bgMusicRef.current.play().catch(e => console.log('Audio play failed:', e));

        // Load photo textures
        const loader = new THREE.TextureLoader();
        const photoFiles = [
            process.env.PUBLIC_URL + '/christmas/image1.jpeg',
            process.env.PUBLIC_URL + '/christmas/image2.jpeg',
            process.env.PUBLIC_URL + '/christmas/image3.jpeg',
            process.env.PUBLIC_URL + '/christmas/image4.jpeg',
            process.env.PUBLIC_URL + '/christmas/image5.jpeg'
        ];

        photoFiles.forEach((f, i) => {
            photoTexturesRef.current[i] = loader.load(f, (texture) => {
                texture.needsUpdate = true;
                if (photoMeshesRef.current[i]) {
                    photoMeshesRef.current[i].material.map = texture;
                    photoMeshesRef.current[i].material.needsUpdate = true;
                }
            });
        });

        // Create textures
        texturesRef.current = {
            gold: createCustomTexture('gold_glow', THREE),
            red: createCustomTexture('red_light', THREE),
            gift: createCustomTexture('gift_red', THREE)
        };

        // Initialize Three.js
        const container = containerRef.current;
        sceneRef.current = new THREE.Scene();
        sceneRef.current.fog = new THREE.FogExp2(0x000000, 0.002);

        cameraRef.current = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        cameraRef.current.position.z = 100;

        rendererRef.current = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        rendererRef.current.setSize(window.innerWidth, window.innerHeight);
        rendererRef.current.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(rendererRef.current.domElement);

        // Create particle systems
        groupGoldRef.current = createParticleSystem('gold', CONFIG.goldCount, 2.0, THREE, sceneRef.current, texturesRef.current);
        groupRedRef.current = createParticleSystem('red', CONFIG.redCount, 3.5, THREE, sceneRef.current, texturesRef.current);
        groupGiftRef.current = createParticleSystem('gift', CONFIG.giftCount, 3.0, THREE, sceneRef.current, texturesRef.current);

        // Create photos
        const geo = new THREE.PlaneGeometry(8, 8);
        const borderGeo = new THREE.PlaneGeometry(9, 9);
        const borderMat = new THREE.MeshBasicMaterial({ color: 0xFFD700 });

        for (let i = 0; i < 5; i++) {
            const mat = new THREE.MeshBasicMaterial({
                map: photoTexturesRef.current[i],
                side: THREE.DoubleSide
            });
            const mesh = new THREE.Mesh(geo, mat);
            const border = new THREE.Mesh(borderGeo, borderMat);
            border.position.z = -0.1;
            mesh.add(border);
            mesh.visible = false;
            mesh.scale.set(0, 0, 0);
            sceneRef.current.add(mesh);
            photoMeshesRef.current.push(mesh);
        }

        // Create decorations
        // Title
        const titleCanvas = document.createElement('canvas');
        titleCanvas.width = 1024;
        titleCanvas.height = 256;
        const titleCtx = titleCanvas.getContext('2d');
        titleCtx.font = 'bold italic 90px "Times New Roman"';
        titleCtx.fillStyle = '#FFD700';
        titleCtx.textAlign = 'center';
        titleCtx.shadowColor = "#FF0000";
        titleCtx.shadowBlur = 40;
        titleCtx.fillText("MERRY CHRISTMAS", 512, 130);

        const titleTex = new THREE.CanvasTexture(titleCanvas);
        const titleMat = new THREE.MeshBasicMaterial({ map: titleTex, transparent: true, blending: THREE.AdditiveBlending });
        titleMeshRef.current = new THREE.Mesh(new THREE.PlaneGeometry(60, 15), titleMat);
        titleMeshRef.current.position.set(0, 50, 0);
        sceneRef.current.add(titleMeshRef.current);

        // Star
        const starCanvas = document.createElement('canvas');
        starCanvas.width = 128;
        starCanvas.height = 128;
        const sCtx = starCanvas.getContext('2d');
        sCtx.fillStyle = "#FFFF00";
        sCtx.shadowColor = "#FFF";
        sCtx.shadowBlur = 20;
        sCtx.beginPath();
        const cx = 64, cy = 64, outer = 50, inner = 20;
        for (let i = 0; i < 5; i++) {
            sCtx.lineTo(cx + Math.cos((18 + i * 72) / 180 * Math.PI) * outer, cy - Math.sin((18 + i * 72) / 180 * Math.PI) * outer);
            sCtx.lineTo(cx + Math.cos((54 + i * 72) / 180 * Math.PI) * inner, cy - Math.sin((54 + i * 72) / 180 * Math.PI) * inner);
        }
        sCtx.closePath();
        sCtx.fill();
        const starTex = new THREE.CanvasTexture(starCanvas);
        const starMat = new THREE.MeshBasicMaterial({ map: starTex, transparent: true, blending: THREE.AdditiveBlending });
        starMeshRef.current = new THREE.Mesh(new THREE.PlaneGeometry(12, 12), starMat);
        starMeshRef.current.position.set(0, CONFIG.treeHeight / 2 + 2, 0);
        sceneRef.current.add(starMeshRef.current);

        // Love text
        const loveCanvas = document.createElement('canvas');
        loveCanvas.width = 1024;
        loveCanvas.height = 256;
        const lCtx = loveCanvas.getContext('2d');
        lCtx.font = 'bold 120px "Segoe UI", sans-serif';
        lCtx.fillStyle = '#FF69B4';
        lCtx.textAlign = 'center';
        lCtx.shadowColor = "#FF1493";
        lCtx.shadowBlur = 40;
        lCtx.fillText("... LOVE ... ❤️", 512, 130);
        const loveTex = new THREE.CanvasTexture(loveCanvas);
        const loveMat = new THREE.MeshBasicMaterial({ map: loveTex, transparent: true, blending: THREE.AdditiveBlending });
        loveMeshRef.current = new THREE.Mesh(new THREE.PlaneGeometry(70, 18), loveMat);
        loveMeshRef.current.position.set(0, 0, 20);
        loveMeshRef.current.visible = false;
        sceneRef.current.add(loveMeshRef.current);

        // Animation loop
        const animate = () => {
            animationIdRef.current = requestAnimationFrame(animate);
            const time = Date.now() * 0.001;
            const speed = 0.08;
            const handRotY = (handXRef.current - 0.5) * 4.0;
            const state = stateRef.current;

            updateParticleGroup(groupGoldRef.current, 'gold', state, speed, handRotY, time);
            updateParticleGroup(groupRedRef.current, 'red', state, speed, handRotY, time);
            updateParticleGroup(groupGiftRef.current, 'gift', state, speed, handRotY, time);

            // Update photo textures
            photoMeshesRef.current.forEach((mesh, i) => {
                if (!mesh.material.map && photoTexturesRef.current[i]) {
                    mesh.material.map = photoTexturesRef.current[i];
                    mesh.material.needsUpdate = true;
                }
            });

            if (state === 'TREE') {
                titleMeshRef.current.visible = true;
                starMeshRef.current.visible = true;
                loveMeshRef.current.visible = false;
                titleMeshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                starMeshRef.current.rotation.z -= 0.02;
                starMeshRef.current.material.opacity = 0.7 + 0.3 * Math.sin(time * 5);
                photoMeshesRef.current.forEach(m => {
                    m.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
                    m.visible = false;
                });
            } else if (state === 'HEART') {
                titleMeshRef.current.visible = false;
                starMeshRef.current.visible = false;
                loveMeshRef.current.visible = true;
                photoMeshesRef.current.forEach(m => { m.visible = false; });
                const s = 1 + Math.abs(Math.sin(time * 3)) * 0.1;
                loveMeshRef.current.scale.set(s, s, 1);
            } else if (state === 'EXPLODE') {
                titleMeshRef.current.visible = false;
                starMeshRef.current.visible = false;
                loveMeshRef.current.visible = false;

                const baseAngle = groupGoldRef.current.rotation.y;
                const angleStep = (Math.PI * 2) / 5;
                let bestIdx = 0;
                let maxZ = -999;

                photoMeshesRef.current.forEach((mesh, i) => {
                    mesh.visible = true;
                    const angle = baseAngle + i * angleStep;
                    const x = Math.sin(angle) * CONFIG.photoOrbitRadius;
                    const z = Math.cos(angle) * CONFIG.photoOrbitRadius;
                    const y = Math.sin(time + i) * 3;

                    mesh.position.lerp(new THREE.Vector3(x, y, z), 0.1);
                    mesh.lookAt(cameraRef.current.position);

                    if (z > maxZ) {
                        maxZ = z;
                        bestIdx = i;
                    }

                    if (z > 5) {
                        const distScale = 1.0 + (z / CONFIG.photoOrbitRadius) * 0.8;
                        mesh.scale.lerp(new THREE.Vector3(distScale, distScale, distScale), 0.1);
                    } else {
                        mesh.scale.lerp(new THREE.Vector3(0.6, 0.6, 0.6), 0.1);
                    }
                });
                selectedIndexRef.current = bestIdx;
            } else if (state === 'PHOTO') {
                loveMeshRef.current.visible = false;
                photoMeshesRef.current.forEach((mesh, i) => {
                    if (i === selectedIndexRef.current) {
                        mesh.position.lerp(new THREE.Vector3(0, 0, 60), 0.1);
                        mesh.scale.lerp(new THREE.Vector3(5, 5, 5), 0.1);
                        mesh.lookAt(cameraRef.current.position);
                        mesh.rotation.z = 0;
                    } else {
                        mesh.scale.lerp(new THREE.Vector3(0, 0, 0), 0.1);
                    }
                });
            }

            rendererRef.current.render(sceneRef.current, cameraRef.current);
        };

        animate();

        // Initialize hand tracking
        try {
            const { Hands } = await import('@mediapipe/hands');
            const { Camera } = await import('@mediapipe/camera_utils');

            const hands = new Hands({
                locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
            });

            hands.setOptions({
                maxNumHands: 2,
                modelComplexity: 1,
                minDetectionConfidence: 0.5,
                minTrackingConfidence: 0.5
            });

            let frameCnt = 0;

            hands.onResults(results => {
                const ctx = previewCanvasRef.current?.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, 100, 75);
                    ctx.drawImage(results.image, 0, 0, 100, 75);
                }

                // Heart detection
                if (results.multiHandLandmarks.length === 2) {
                    const h1 = results.multiHandLandmarks[0];
                    const h2 = results.multiHandLandmarks[1];
                    const distIndex = Math.hypot(h1[8].x - h2[8].x, h1[8].y - h2[8].y);
                    const distThumb = Math.hypot(h1[4].x - h2[4].x, h1[4].y - h2[4].y);
                    if (distIndex < 0.15 && distThumb < 0.15) {
                        stateRef.current = 'HEART';
                        if (statusRef.current) {
                            statusRef.current.innerText = "🫶 Yêu Thương";
                            statusRef.current.style.color = "#FF69B4";
                        }
                        return;
                    }
                }

                if (results.multiHandLandmarks.length > 0) {
                    const lm = results.multiHandLandmarks[0];
                    handXRef.current = lm[9].x;

                    const tips = [8, 12, 16, 20];
                    const wrist = lm[0];
                    let openDist = 0;
                    tips.forEach(i => openDist += Math.hypot(lm[i].x - wrist.x, lm[i].y - wrist.y));
                    const avgDist = openDist / 4;
                    const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);

                    if (avgDist < 0.25) {
                        stateRef.current = 'TREE';
                        if (statusRef.current) {
                            statusRef.current.innerText = "✊ Thu Cây Thông";
                            statusRef.current.style.color = "#FFD700";
                        }
                    } else if (pinchDist < 0.05) {
                        stateRef.current = 'PHOTO';
                        if (statusRef.current) {
                            statusRef.current.innerText = "👌 Xem Ảnh";
                            statusRef.current.style.color = "#00FFFF";
                        }
                    } else {
                        stateRef.current = 'EXPLODE';
                        if (statusRef.current) {
                            statusRef.current.innerText = "🖐 Bung Quà & Ảnh";
                            statusRef.current.style.color = "#FFA500";
                        }
                    }
                } else {
                    stateRef.current = 'TREE';
                    if (statusRef.current) {
                        statusRef.current.innerText = "🎄 Giáng Sinh An Lành 🎄";
                        statusRef.current.style.color = "#FFF";
                    }
                }
            });

            const cameraUtils = new Camera(videoRef.current, {
                onFrame: async () => {
                    frameCnt++;
                    if (frameCnt % 2 !== 0) return;
                    await hands.send({ image: videoRef.current });
                },
                width: 320,
                height: 240
            });
            cameraUtils.start();
        } catch (error) {
            console.error('Hand tracking initialization failed:', error);
        }
    }, [createCustomTexture, createParticleSystem, updateParticleGroup]);

    // Handle resize
    useEffect(() => {
        const handleResize = () => {
            if (cameraRef.current && rendererRef.current) {
                cameraRef.current.aspect = window.innerWidth / window.innerHeight;
                cameraRef.current.updateProjectionMatrix();
                rendererRef.current.setSize(window.innerWidth, window.innerHeight);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Cleanup
    useEffect(() => {
        return () => {
            if (animationIdRef.current) {
                cancelAnimationFrame(animationIdRef.current);
            }
            if (bgMusicRef.current) {
                bgMusicRef.current.pause();
                bgMusicRef.current = null;
            }
            if (rendererRef.current) {
                rendererRef.current.dispose();
            }
        };
    }, []);

    return (
        <div className="christmas-page">
            {/* Back Button */}
            <Link to="/" className="back-btn">
                ← Quay lại
            </Link>

            <div id="error-log"></div>

            {/* UI Layer */}
            <div className="ui-layer">
                <div ref={statusRef} className="badge">🎄 Giáng Sinh An Lành 🎄</div>
                <div className="guide">
                    🖐 <b>Xòe:</b> Bung Quà & Đèn &nbsp;|&nbsp;
                    👌 <b>Pinch:</b> Xem ảnh &nbsp;|&nbsp;
                    🫶 <b>Heart:</b> Yêu thương &nbsp;|&nbsp;
                    ✊ <b>Nắm:</b> Thu cây
                </div>
                <button ref={btnStartRef} onClick={startSystem} className="start-btn">
                    BẮT ĐẦU
                </button>
            </div>

            {/* Canvas Container */}
            <div ref={containerRef} className="canvas-container"></div>

            {/* Hidden Video */}
            <video ref={videoRef} className="input-video" style={{ display: 'none' }}></video>

            {/* Camera Preview */}
            <canvas ref={previewCanvasRef} className="camera-preview"></canvas>
        </div>
    );
};

export default ChristmasPage;
